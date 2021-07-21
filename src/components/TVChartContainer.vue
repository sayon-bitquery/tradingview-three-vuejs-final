<template>
    <div>
        <div v-if="addressInfo.hasOwnProperty('name')">
            <p>Name: <strong>{{ addressInfo.name }}</strong> | Symbol: <strong>{{ addressInfo.symbol }}/BNB</strong></p>
        </div>
        <div class="TVChartContainer" id="tv_chart_container"/>
    </div>
</template>

<script>
import api from './api/index'

export default {
    name: 'TVChartContainer',
    props: {
        symbol: {
            default: 'BITQUERY',
            type: String,
        },
        interval: {
            default: 'D',
            type: String,
        },
        containerId: {
            default: 'tv_chart_container',
            type: String,
        },
        datafeedUrl: {
            default: 'https://demo-feed-data.tradingview.com',
            type: String,
        },
        libraryPath: {
            default: '/charting_library/charting_library/',
            type: String,
        },
        chartsStorageUrl: {
            default: 'https://saveload.tradingview.com',
            type: String,
        },
        chartsStorageApiVersion: {
            default: '1.2',
            type: String,
        },
        clientId: {
            default: 'tradingview.com',
            type: String,
        },
        fullscreen: {
            default: false,
            type: Boolean,
        },
        autosize: {
            default: true,
            type: Boolean,
        },
        studiesOverrides: {
            type: Object,
        }
    },
    tvWidget: null,
    data() {
        return {
            baseCurrency: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
            addressInfo: {},
            searchValue: "",
            getSearchAddress: [],
            getAllAddressValue: [],
            showSearchChild: false,
        }
    },
    mounted() {
        const widgetOptions = {
            symbol: this.symbol,
            datafeed: api(this.baseCurrency),
            interval: this.interval,
            container_id: this.containerId,
            library_path: this.libraryPath,
            theme: 'Dark',
            locale: 'en',
            disabled_features: ['use_localstorage_for_settings'],
            charts_storage_url: this.chartsStorageUrl,
            charts_storage_api_version: this.chartsStorageApiVersion,
            client_id: this.clientId,
            user_id: this.userId,
            fullscreen: this.fullscreen,
            autosize: this.autosize,
            studies_overrides: this.studiesOverrides,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        this.tvWidget = new TradingView.widget(widgetOptions)
    },
    destroyed() {
        if (this.tvWidget !== null) {
            this.tvWidget.remove()
            this.tvWidget = null
        }
    },
    created() {
        this.getAllAddress();
        if (this.$route.query.hasOwnProperty('type')) {
            this.baseCurrency = this.$route.query.type;
        }
    },
    methods: {
        changeAddress(address) {
            this.baseCurrency = address;
            this.searchValue = "";

            this.$router.push(`/tranding-view?type=${address}`);

            window.location.reload();
        },

        search() {
            let term = this.searchValue;
            let search = new RegExp(term , 'i');

            this.getSearchAddress = this.getAllAddressValue.filter(item => search.test(item.name));

            this.showSearchChild = !!this.getSearchAddress.length;
        },

        getCoinInfo() {
            const query = `
                        {
                          ethereum(network: bsc) {
                            dexTrades(
                              options: {desc: ["block.height", "transaction.index"], limit: 1}
                              exchangeAddress: {is: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"}
                              baseCurrency: {is: "${this.baseCurrency}"}
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
                        `;
            const url = "https://graphql.bitquery.io/";
            const opts = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": "BQYUGuoO6tZKM20I0lfBNCTEC4ouBCT1"
                },
                body: JSON.stringify({
                    query
                })
            };
            fetch(url, opts)
                .then(res => res.json())
                .then(response => {
                    this.addressInfo = response.data.ethereum.dexTrades[0].baseCurrency;
                })
                .catch(console.error);

        },
    },
    watch: {
        searchValue(value) {
            if (value === '') {
                this.showSearchChild = false;
            }
        },
        baseCurrency() {
            this.getCoinInfo();
        }
    }
}
</script>

<style>
.TVChartContainer {
    position: absolute;
    width: 100%;
    height: 80%;
}
</style>