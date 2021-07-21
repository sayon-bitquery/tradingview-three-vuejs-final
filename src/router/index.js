import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import TradingView from '../views/TradingView.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/trading-view',
        component: TradingView,
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
