import {createStore} from 'vuex'
import {loginStore} from './components/Login/loginStore'
import {monthlySummaryStore} from './components/MonthlySummary/monthlySummaryStore'
import { payeeStore } from './common/stores/payeeStore'
import { categoryStore } from './common/stores/categoryStore'
import { entryUsersStore } from './common/stores/entryUsersStore'

export const store = createStore({
    modules:{
        loginStore,
        monthlySummaryStore,
        payeeStore,
        entryUsersStore,
        categoryStore
    }
})