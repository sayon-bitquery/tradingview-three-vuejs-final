<template>
    <TVChartContainer :symbol="'BITQUERY'" :interval="'60'"></TVChartContainer>
</template>

<script>
import TVChartContainer from "../components/TVChartContainer";
export default {
    name: "TradingView",
    components: {TVChartContainer},
    props: ["id"],

}
</script>

<style scoped>

</style>