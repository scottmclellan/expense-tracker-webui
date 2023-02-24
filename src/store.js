import {createStore} from 'vuex'
import {loginStore} from './components/Login/loginStore'
import {monthlySummaryStore} from './components/MonthlySummary/monthlySummaryStore'

export const store = createStore({
    modules:{
        loginStore,
        monthlySummaryStore
    }
})