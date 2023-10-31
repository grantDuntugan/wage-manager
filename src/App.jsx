import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { checkUserExists } from './functions/index'
import Auth from './Auth'
import Account from './Account'
import FTReg from './FTReg'

function App() {
  const [user, setUser] = useState(null)
  const [pageState, setPageState] = useState(-1)

  function route() {
    if (!user) {
      return <Auth />
    } else if (pageState === 0) {
      return <FTReg setPageState={setPageState} user={user}/>
    } else if (pageState === 1) {
      return <Account key={user.id} user={user}/>
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session.user)
    }).catch(() => {
      console.log("not logged in yet")
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })
  }, [])

  // routes based on if first time user or not
  useEffect(() => {
    async function checkFirstTimeUser() {
      const res = await checkUserExists(user)
      console.log(res)
      if (res) {
        if (res.length === 0)
          setPageState(0)
        else
          setPageState(1)
      }
    }

    if (user)
      checkFirstTimeUser()
  }, [user])

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {route()}
    </div>
  )
}

export default App