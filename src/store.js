import {createStore} from 'vuex'
import {loginStore} from './components/Login/loginStore'
import {monthlySummaryStore} from './components/MonthlySummary/monthlySummaryStore'
import { payeeStore } from './components/ExpenseUpload/payeeStore'

export const store = createStore({
    modules:{
        loginStore,
        monthlySummaryStore,
        payeeStore
    }
})