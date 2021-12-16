interface RawAccountCToken {
  accountBorrowIndex: string;
  cTokenBalance: string;
  storedBorrowBalance: string;
  symbol: string;
  totalUnderlyingBorrowed: string;
  totalUnderlyingRedeemed: string;
  totalUnderlyingRepaid: string;
  totalUnderlyingSupplied: string;
  market: {
    collateralFactor: string;
    underlyingPrice: string;
    borrowIndex: string; // we may not need this
  };
}

interface AccountCToken
  extends Omit<
    RawAccountCToken,
    | 'accountBorrowIndex'
    | 'cTokenBalance'
    | 'storedBorrowBalance'
    | 'totalUnderlyingBorrowed'
    | 'totalUnderlyingRedeemed'
    | 'totalUnderlyingRepaid'
    | 'totalUnderlyingSupplied'
    | 'market'
  > {
  accountBorrowIndex: number;
  borrowBalanceUnderlying: number;
  cTokenBalance: number;
  storedBorrowBalance: number;
  totalUnderlyingBorrowed: number;
  totalUnderlyingRedeemed: number;
  totalUnderlyingRepaid: number;
  totalUnderlyingSupplied: number;
  market: {
    collateralFactor: number;
    underlyingPrice: number;
    borrowIndex: number;
  };
}

export interface RawAccount {
  id: string;
  countLiquidated: number;
  countLiquidator: number;
  tokens: RawAccountCToken[];
}

interface Account extends Omit<RawAccount, 'tokens'> {
  tokens: AccountCToken[];
  borrowLimit: number;
  borrowBalance: number;
}

export const getHealth = (borrowLimit: number, borrowBalance: number) => {
  if (!borrowLimit || !borrowBalance) {
    return 2;
  }

  return Math.min(2, borrowLimit / borrowBalance).toFixed(2);
};

export const transformAccountData = (rawAccount: RawAccount): Account => {
  const account = {
    ...rawAccount,
    tokens: rawAccount.tokens.map(
      (token) =>
        ({
          ...token,
          accountBorrowIndex: +token.accountBorrowIndex,
          cTokenBalance: +token.cTokenBalance,
          storedBorrowBalance: +token.storedBorrowBalance,
          totalUnderlyingBorrowed: +token.totalUnderlyingBorrowed,
          totalUnderlyingRedeemed: +token.totalUnderlyingRedeemed,
          totalUnderlyingRepaid: +token.totalUnderlyingRepaid,
          totalUnderlyingSupplied: +token.totalUnderlyingSupplied,
          market: {
            collateralFactor: +token.market.collateralFactor,
            underlyingPrice: +token.market.underlyingPrice,
            borrowIndex: +token.market.borrowIndex,
          },
        } as AccountCToken)
    ),
  };

  return {
    ...account,
    borrowLimit: account.tokens.reduce(
      (prev, curr) =>
        prev +
        curr.totalUnderlyingSupplied * curr.market.collateralFactor * curr.market.underlyingPrice,
      0
    ),
    borrowBalance: account.tokens.reduce(
      (prev, curr) => prev + curr.totalUnderlyingBorrowed * curr.market.underlyingPrice,
      0
    ),
  };
};
