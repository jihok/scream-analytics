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
  cTokenBalance: number;
  storedBorrowBalance: number;
  totalUnderlyingBorrowed: number;
  totalUnderlyingRedeemed: number;
  totalUnderlyingRepaid: number;
  totalUnderlyingSupplied: number;
  market: {
    collateralFactor: number;
    underlyingPrice: number;
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

const getBorrowLimit = (accountCTokens: AccountCToken[]) => {
  const borrowLimit = accountCTokens.reduce(
    (prev, curr) =>
      prev +
      curr.totalUnderlyingSupplied * curr.market.collateralFactor * curr.market.underlyingPrice,
    0
  );
  accountCTokens.reduce(
    (prev, curr) => prev + curr.totalUnderlyingBorrowed * curr.market.underlyingPrice,
    0
  );
  // for (const market of markets) {
  //   tempBorrowLimit = tempBorrowLimit.plus(
  //     (market?.supplyBalance || new BigNumber(0))
  //       .times(+market?.collateralFactor || 0)
  //       .times(market?.underlyingPriceUSD)
  //   );

  //   tempBorrowBalance = tempBorrowBalance.plus(
  //     (market?.borrowBalance || new BigNumber(0)).times(market?.underlyingPriceUSD)
  //   );
  // }
};

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
