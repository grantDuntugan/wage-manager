import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    setLoading(true)
    let { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })

    if (error) {
      alert(error.error_description || error.message)
    }
    setLoading(false)
  }


  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Wage Manager</h1>
        <p className="description">Sign in via Google below</p>
        <form className="form-widget">
          <div>
            <button className={'button block'} disabled={loading} onClick={handleLogin}>
              {loading ? <span>Loading</span> : <span>Log in with Google</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}