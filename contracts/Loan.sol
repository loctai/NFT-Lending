// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./common/IERC20.sol";
import "./common/IERC721.sol";

contract LoanNFT is ReentrancyGuard, Ownable {
    using Address for address;
    using SafeMath for uint256;

    uint256 public currentItemId;
    address public feeReceiver;
    uint256 public feePerThousand = 10; // 10 is 1 since 10/1000 = 0,01
    uint256 public constant PERCENTS_DIVIDER = 1000;

    bytes4 public constant ERC721_Interface = bytes4(0x80ac58cd);

    enum CovenantStatus {
        LISTING,
        LOCKED,
        ENDED
    }
    struct Covenant {
        address nftContract; // nft contract address
        address tokenAdr; // payment token Address
        uint256 tokenId; // nft token Id
        uint256 price; // price of nft
        uint256 priceBorrow; // price of borrow
        uint256 maxDays; // max day borrow
        uint256 timeExpired;
        uint256 daysBorrow; // days of borrow
        uint256 borrowedAt; // time borrow
        CovenantStatus status;
        address borrower;
        address lender;
    }

    mapping(uint256 => Covenant) public idToCovenant;
    mapping(address => uint256) public loanAccepted;
    mapping(address => uint256) public loanLiquidated;

    event CovenantListed(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        address tokenAdr,
        uint256 price,
        uint256 priceBorrow,
        uint256 maxDays,
        uint8 status,
        address borrower,
        address lender
    );

    event CovenantUnlisted(
        uint256 itemId,
        address nftContract,
        uint256 tokenId
    );
    event CovenantAccept(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        address borrower,
        uint256 daysToRent,
        uint256 timeExpired
    );
    event CovenantLiquidate(
        uint256 itemId,
        address nftContract,
        uint256 tokenId
    );
    event CovenantReturnNFT(
        uint256 itemId,
        address nftContract,
        uint256 tokenId
    );

    modifier onlyNftOwner(address _nftAddress, uint256 _tokenId) {
        require(
            IERC721(_nftAddress).ownerOf(_tokenId) == msg.sender,
            "You are not NFT owner"
        );
        _;
    }

    modifier onlyBorrower(uint256 itemId) {
        require(
            idToCovenant[itemId].borrower == msg.sender,
            "Sender is not borrower"
        );
        _;
    }
    modifier isListing(uint256 itemId) {
        require(
            idToCovenant[itemId].status == CovenantStatus.LISTING,
            "Loan covenant is not listing."
        );
        _;
    }
    modifier onlyLender(uint256 itemId) {
        require(
            idToCovenant[itemId].lender == msg.sender,
            "only owner is allowed"
        );
        _;
    }

    constructor(uint256 fee) {
        feePerThousand = fee;
    }

    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(
            _feeReceiver != address(0),
            "The fee receiver address cannot be null"
        );
        feeReceiver = _feeReceiver;
    }

    function setFeePerThousand(uint256 _newFee) external onlyOwner {
        require(
            _newFee > 0 && _newFee <= 500,
            "The fee must be between 0 and 999"
        );
        feePerThousand = _newFee;
    }

    function listCovenant(
        address _nftContract,
        uint256 _tokenId,
        address _tokenAdr,
        uint256 _price,
        uint256 _priceBorrow,
        uint256 _maxDays
    ) external nonReentrant onlyNftOwner(_nftContract, _tokenId) {
        IERC721 nftRegistry = IERC721(_nftContract);
        bool isERC721 = nftRegistry.supportsInterface(ERC721_Interface);
        require(isERC721, "Contract needs to be TRC721");

        currentItemId = currentItemId.add(1);

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        idToCovenant[currentItemId] = Covenant(
            _nftContract,
            _tokenAdr,
            _tokenId,
            _price,
            _priceBorrow,
            _maxDays,
            0,
            0,
            0,
            CovenantStatus.LISTING,
            address(0),
            msg.sender
        );
        emit CovenantListed(
            currentItemId,
            _nftContract,
            _tokenId,
            _tokenAdr,
            _price,
            _priceBorrow,
            _maxDays,
            uint8(CovenantStatus.LISTING),
            address(0),
            msg.sender
        );
    }

    function endListedItem(uint256 itemId)
        external
        onlyLender(itemId)
        nonReentrant
    {
        require(
            idToCovenant[itemId].status == CovenantStatus.LISTING,
            "Loan covenant is not listing."
        );
        Covenant storage loanCovenant = idToCovenant[itemId];
        IERC721(loanCovenant.nftContract).transferFrom(
            address(this),
            msg.sender,
            loanCovenant.tokenId
        );
        loanCovenant.status = CovenantStatus.ENDED;
        emit CovenantUnlisted(
            itemId,
            loanCovenant.nftContract,
            loanCovenant.tokenId
        );
    }

    function acceptCovenant(uint256 itemId, uint256 daysToRent)
        public
        payable
        nonReentrant
        isListing(itemId)
    {
        require(
            idToCovenant[itemId].lender != msg.sender,
            "can't borrow own nft"
        );
        require(daysToRent > 0, "Days must be greater than 0");

        Covenant storage loanCovenant = idToCovenant[itemId];

        uint256 _expireTime = daysToRent.mul(86400).add(block.timestamp);

        uint256 rentPrice = daysToRent.mul(loanCovenant.priceBorrow);
        uint256 totalAmount = rentPrice + loanCovenant.price;

        uint256 feeAmount = rentPrice.mul(feePerThousand).div(PERCENTS_DIVIDER);

        uint256 lenderAmount = rentPrice.sub(feeAmount);

        if (loanCovenant.tokenAdr == address(0)) {
            require(msg.value >= totalAmount, "Loan amount not exact");
            if (feeAmount > 0) {
                payable(feeReceiver).transfer(feeAmount);
            }
            payable(loanCovenant.lender).transfer(lenderAmount);
        } else {
            require(
                IERC20(loanCovenant.tokenAdr).balanceOf(msg.sender) >=
                    totalAmount,
                "Insufficient payment funds"
            );
            if (feeAmount > 0) {
                IERC20(loanCovenant.tokenAdr).transferFrom(
                    msg.sender,
                    feeReceiver,
                    feeAmount
                );
            }
            IERC20(loanCovenant.tokenAdr).transferFrom(
                msg.sender,
                loanCovenant.lender,
                lenderAmount
            );
            IERC20(loanCovenant.tokenAdr).transferFrom(
                msg.sender,
                address(this),
                loanCovenant.price
            );
        }
        IERC721(loanCovenant.nftContract).transferFrom(
            address(this),
            msg.sender,
            loanCovenant.tokenId
        );
        loanCovenant.daysBorrow = daysToRent;
        loanCovenant.timeExpired = _expireTime;
        loanCovenant.borrower = msg.sender;
        loanCovenant.borrowedAt = block.timestamp;
        loanCovenant.status = CovenantStatus.LOCKED;
        loanAccepted[msg.sender] = loanAccepted[msg.sender].add(1);
        emit CovenantAccept(
            itemId,
            loanCovenant.nftContract,
            loanCovenant.tokenId,
            msg.sender,
            daysToRent,
            _expireTime
        );
    }

    function liquidate(uint256 itemId)
        external
        payable
        onlyLender(itemId)
        nonReentrant
    {
        require(
            idToCovenant[itemId].status == CovenantStatus.LOCKED &&
                idToCovenant[itemId].timeExpired < block.timestamp,
            "Not time for liquidate covenant"
        );
        Covenant storage loanCovenant = idToCovenant[itemId];
        if (loanCovenant.tokenAdr == address(0)) {
            payable(loanCovenant.lender).transfer(loanCovenant.price);
        } else {
            IERC20(loanCovenant.tokenAdr).transferFrom(
                address(this),
                loanCovenant.lender,
                loanCovenant.price
            );
        }
        loanCovenant.status = CovenantStatus.ENDED;

        loanLiquidated[loanCovenant.borrower] = loanLiquidated[
            loanCovenant.borrower
        ].add(1);

        emit CovenantLiquidate(
            itemId,
            loanCovenant.nftContract,
            loanCovenant.tokenId
        );
    }

    function returnNFT(uint256 itemId) external onlyBorrower(itemId) {
        require(
            idToCovenant[itemId].status == CovenantStatus.LOCKED &&
                idToCovenant[itemId].timeExpired > block.timestamp,
            "Time is up. Contact lender for extend time."
        );

        Covenant storage loanCovenant = idToCovenant[itemId];
        if (loanCovenant.tokenAdr == address(0)) {
            payable(loanCovenant.borrower).transfer(loanCovenant.price);
        } else {
            IERC20 paymentToken = IERC20(loanCovenant.tokenAdr);
            require(
                paymentToken.transfer(
                    loanCovenant.borrower,
                    loanCovenant.price
                ),
                "refund to borrower failed"
            );
        }

        IERC721(loanCovenant.nftContract).transferFrom(
            msg.sender,
            loanCovenant.lender,
            loanCovenant.tokenId
        );
        loanCovenant.status = CovenantStatus.ENDED;

        emit CovenantReturnNFT(
            itemId,
            loanCovenant.nftContract,
            loanCovenant.tokenId
        );
    }

    function withdrawToken(
        address tokenAdr,
        address recipient,
        uint256 amount
    ) external nonReentrant onlyOwner {
        IERC20 paymentToken = IERC20(tokenAdr);
        require(
            paymentToken.balanceOf(address(this)) >= amount,
            "Insufficient payment funds"
        );
        paymentToken.transfer(recipient, amount);
    }

    function withdrawNFT(address nftContract, uint256 tokenId)
        external
        nonReentrant
        onlyOwner
    {
        IERC721 paymentToken = IERC721(nftContract);
        paymentToken.transferFrom(address(this), msg.sender, tokenId);
    }
}
