import { useEffect, useState } from 'react'
import * as _ from 'lodash'
import Currencies from '../json/currencies-json.json'
import LiveRates from '../json/live-rates-json.json'
import WalletBalance from '../json/wallet-balance-json.json'
import BigNumber from 'bignumber.js';

interface TokenProps {
    onBalance: (total: number) => void;
  }

const Token: React.FC<TokenProps> = ({ onBalance }) => {
  const [tokenList, setTokenList] = useState<any[]>([]);
  
  useEffect(() => {
	  if (tokenList.length === 0) {
		  mergeToken()
	  }
  }, [])
  
  const mergeToken = () => {
      try {
        const allList = LiveRates?.tiers ?? [];
        const currencies = Currencies?.currencies ?? [];
        const walletList = WalletBalance?.wallet ?? [];
        
        const allListMap = new Map(
          allList.map(item => [item.from_currency, item])
        );
        
        const walletListMap = new Map(
          walletList.map(item => [item.currency, item])
        );
        
        const mergedArray = currencies.map(item => ({
          ...item,
          ...(allListMap.get(item.coin_id) || {}),
          ...(walletListMap.get(item.coin_id) || {})
        }));
        setTokenList(mergedArray);
		calcBalance(mergedArray);
      } catch (error) {
        console.error('Error merging tokens:', error);
      }
    };
	
	const formatToTwoDecimals = (value: string | number | BigNumber,roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP) => {
		try {
		    const bn = new BigNumber(value);
			
			if (value === 0) {
				return value;
			}
		    
		    if (!bn.isFinite()) {
		      throw new Error('Invalid number input');
		    }
		    
		    return bn.toFixed(6, roundingMode);
		    
		  } catch (error) {
		    console.error('Error formatting number:', error);
		    return 0;
		  }
	}
	
	const calculateExchange = (
	  amount: string | number,
	  exchangeRate: string | number,
	  decimalPlaces: number = 2
	) => {
	  if (!amount || !exchangeRate) {
	    throw new Error('Amount and exchange rate are required');
	  }
	
	  const amountBN = new BigNumber(amount);
	  const rateBN = new BigNumber(exchangeRate);
	
	  if (amountBN.isNaN() || rateBN.isNaN()) {
	    throw new Error('Invalid number input');
	  }
	
	  if (amountBN.isNegative() || rateBN.isNegative()) {
	    throw new Error('Amount and exchange rate must be positive');
	  }
	
	  return amountBN
	    .multipliedBy(rateBN)
	    .decimalPlaces(decimalPlaces, BigNumber.ROUND_HALF_UP)
	    .toString();
	}
	
	const calcBalance = (newList) => {
		let result = 0;
		newList.map(item => {
			result += Number(calculateExchange(item.amount, item.rates[0].rate))
		})
		onBalance(result);
	}
	
    const renderTokenCard = (token: any) => {
      return (
        <div key={token.coin_id || token.from_currency} className="flex justify-between bg-white mb-6 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            {token.colorful_image_url && (
              <img 
                src={token.colorful_image_url} 
                alt={token.name} 
                className="w-10 h-10"
              />
            )}
            <h3>
              {token.name} 
            </h3>
          </div>
		  
		  <div className="text-right">
			<div className="font-bold">{formatToTwoDecimals(token.amount)}</div>
			<div className="text-gray-500">$ {calculateExchange(token.amount, token.rates[0].rate)}</div>
		  </div>
        </div>
      );
    };
  
  return (
      <div className="token-page">
        {tokenList.length > 0 ? (
          <div className="token-grid">
            {tokenList.map(renderTokenCard)}
          </div>
        ) : (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading token data...</p>
          </div>
        )}
      </div>
    );
}

export default Token
