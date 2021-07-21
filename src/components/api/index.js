import axios from 'axios';
import * as Bitquery from './../TVChartContainer/Bitquery';

const configurationData = {
    supported_resolutions: ['1','5','15','30', '60','1D', '1W', '1M']
};

export default(baseCurrency) => ({
    onReady: (callback) => {
        setTimeout(() => callback(configurationData));
    },

    resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) =>{

        const response = await axios.post(
            Bitquery.endpoint, {
                query: `
                        {
                          ethereum(network: bsc) {
                            dexTrades(
                              options: {desc: ["block.height", "transaction.index"], limit: 1}
                              exchangeAddress: {is: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"}
                              baseCurrency: {is: "${baseCurrency}"}
                              quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
                            ) 
                            {
                              block {
                                height
                                timestamp {
                                  time(format: "%Y-%m-%d %H:%M:%S") 
                                }
                              }
                              transaction {
                                index
                              }
                              baseCurrency {
                                name
                                symbol
                                decimals
                              }
                              quotePrice
                            }
                          }
                        }
                        `,
                variables: {
                    "tokenAddress": symbolName
                },
                mode: 'cors',
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": "YOUR UNIQUE API KEY"
                }
            }
        );

        const coin = response.data.data.ethereum.dexTrades[0].baseCurrency;

        if(!coin){
            onResolveErrorCallback();
        }else{
            const symbol = {
                ticker: symbolName,
                name: `${coin.symbol}/BNB`,
                session: '24x7',
                timezone: 'Etc/UTC',
                minmov: 1,
                pricescale: 10000000,
                has_intraday: true,
                intraday_multipliers: ['1', '5', '15', '30', '60'],
                has_empty_bars: true,
                has_weekly_and_monthly: false,
                supported_resolutions: configurationData.supported_resolutions,
                volume_precision: 1,
                data_status: 'streaming',
            }
            onSymbolResolvedCallback(symbol)
        }
    },

    getBars: async(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) =>{
        try{
            if (resolution==='1D') {
                resolution = 1440;
            }
            const response2 = await axios.post(Bitquery.endpoint, {
                query: `
                        {
                          ethereum(network: bsc) {
                            dexTrades(
                              options: {asc: "timeInterval.minute"}
                              date: {since: "2021-06-20T07:23:21.000Z", till: "${new Date().toISOString()}"}
                              exchangeAddress: {is: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"}
                              baseCurrency: {is: "${baseCurrency}"},
                              quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"},
                              tradeAmountUsd: {gt: 10}
                            ) 
                            {
                              timeInterval {
                                minute(count: 15, format: "%Y-%m-%dT%H:%M:%SZ")  
                              }
                              volume: quoteAmount
                              high: quotePrice(calculate: maximum)
                              low: quotePrice(calculate: minimum)
                              open: minimum(of: block, get: quote_price)
                              close: maximum(of: block, get: quote_price) 
                            }
                          }
                        }
                        `,
                variables: {
                    "from": new Date("2021-06-20T07:23:21.000Z").toISOString(),
                    "to": new Date("2021-06-23T15:23:21.000Z").toISOString(),
                    "interval": Number(resolution),
                    "tokenAddress": symbolInfo.ticker
                },
                mode: 'cors',

            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": "YOUR UNIQUE API KEY"
                }
            })

            const bars = response2.data.data.ethereum.dexTrades.map(el => ({
                time: new Date(el.timeInterval.minute).getTime(), // date string in api response
                low: el.low,
                high: el.high,
                open: Number(el.open),
                close: Number(el.close),
                volume: el.volume
            }))

            if (bars.length){
                onHistoryCallback(bars, {noData: false});
            }else{
                onHistoryCallback(bars, {noData: true});
            }

        } catch(err){
            console.log({err})
        }
    },
})
