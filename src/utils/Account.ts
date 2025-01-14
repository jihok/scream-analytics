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
    exchangeRate: string;
    underlyingSymbol: string;
    underlyingName: string;
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
    exchangeRate: number;
    underlyingSymbol: string;
    underlyingName: string;
  };
}

export interface RawAccount {
  id: string;
  countLiquidated: number;
  countLiquidator: number;
  tokens: RawAccountCToken[];
}

export interface Account extends Omit<RawAccount, 'tokens'> {
  tokens: AccountCToken[];
  borrowLimitUSD: number;
  borrowBalanceUSD: number;
  totalSuppliedUSD: number;
  totalBorrowedUSD: number;
}

export const getHealth = (borrowLimit: number, borrowBalance: number) => {
  if (!borrowLimit || !borrowBalance) {
    return 2;
  }

  return Math.min(2, borrowLimit / borrowBalance);
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
            exchangeRate: +token.market.exchangeRate,
            underlyingSymbol: token.market.underlyingSymbol,
            underlyingName: token.market.underlyingName,
          },
        } as AccountCToken)
    ),
  };

  return {
    ...account,
    borrowLimitUSD: account.tokens.reduce(
      (prev, curr) =>
        prev +
        curr.market.collateralFactor *
          curr.cTokenBalance *
          curr.market.exchangeRate *
          curr.market.underlyingPrice,
      0
    ),
    borrowBalanceUSD: account.tokens.reduce(
      (prev, curr) => prev + curr.storedBorrowBalance * curr.market.underlyingPrice,
      0
    ),
    totalBorrowedUSD: account.tokens.reduce(
      (prev, curr) => prev + curr.totalUnderlyingBorrowed * curr.market.underlyingPrice,
      0
    ),
    totalSuppliedUSD: account.tokens.reduce(
      (prev, curr) =>
        prev + curr.cTokenBalance * curr.market.exchangeRate * curr.market.underlyingPrice,
      0
    ),
  };
};
