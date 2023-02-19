import {createStore} from 'vuex'
import {login} from './components/Login/login'

export const store = createStore({
    modules:{
        login,
    }
})