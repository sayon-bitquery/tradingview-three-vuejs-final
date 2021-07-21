<template>
    <TVChartContainer :symbol="'BITQUERY'" :interval="'60'"></TVChartContainer>
</template>

<script>
import TVChartContainer from "../components/TVChartContainer";
export default {
    name: "Home",
    components: {TVChartContainer}
}
</script>

<style scoped>

</style>