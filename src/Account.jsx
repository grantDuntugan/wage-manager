import { useState, useEffect } from 'react'
import { getPossibleAssociates, getTasks, getUserDetails, getUsername, updateAssociate, uploadTask, approveTask, deleteTask, completeTask } from './functions'
import { supabase } from './supabaseClient'

export default function Account({ user }) {
  const [role, setRole] = useState(null)
  const [associate, setAssociate] = useState(null)
  const [username, setUsername] = useState(null)
  const [possibleAssociates, setPossibleAssociates] = useState(null)
  const [refresh, setRefresh] = useState(true)
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState(null)

  const [newTaskName, setNewTaskName] = useState(null)
  const [newTaskDetails, setNewTaskDetails] = useState(null)
  const [newTaskValue, setNewTaskValue] = useState(null)
  const [eMessage, setEMessage] = useState(false)

  useEffect(() => {
    async function getAndSetDetails() {
      setLoading(true)
      let userDetails = await getUserDetails(user)
      userDetails = userDetails[0]
      setRole(userDetails.role)
      setUsername(userDetails.username)

      const associateUsername = await getUsername(userDetails.associate)
      setAssociate({uid: userDetails.associate, username: associateUsername})

      if (!userDetails.associate) {
        const userDets = {
          role: userDetails.role,
          username: userDetails.username
        }
        const asses = await getPossibleAssociates(userDets);
        setPossibleAssociates(asses)
      } else {
        const t = await getTasks(user)
        setTasks(t)
      }
    }

    getAndSetDetails()
    setLoading(false)
  }, [refresh])

  function handleSubmit(event) {
    event.preventDefault()

    if (!newTaskName || !newTaskValue) {
      setEMessage(true)
      return
    }

    let provider
    let receiver
    if (role === "provider") {
      provider = user.id
      receiver = associate.uid
    } else {
      receiver = user.id
      provider = associate.uid
    }

    const data = {
      name: newTaskName,
      details: newTaskDetails,
      value: newTaskValue,
      provider,
      receiver,
    }

    async function helper() {
      await uploadTask(data)
    }
    helper()

    setNewTaskName(null)
    setNewTaskDetails(null)
    setNewTaskValue(null)
    setEMessage(false)
    setRefresh(!refresh)
  }

  async function submitAssociate(e) {
    const uid = e.target[0][0].value
    await updateAssociate(user, uid)
    setRefresh(!refresh)
  }

  function handleAssociateScreen() {
    if (associate) {
      return "Your associate: " + associate.username
    } else {
      if (possibleAssociates) {
        return (
          <div>
            <form onSubmit={async (e) => {await submitAssociate(e)}}>
              <span>You have no associate. Search for one here:</span>
              <select name="users" id="users">
                {
                  possibleAssociates.map((val) => {
                    return <option value={val.uid} key={val.uid}>{val.username}</option>
                  })  
                }
              </select>
              <button type="submit">Submit</button>
            </form>
          </div>
        )
      }
      else {
        return "loading..."
      }
    }
  }

  function handleAddTaskScreen() {
    if (!associate) {
      return
    }

    return (
      <form className='form-widget' style={{marginTop: '3rem'}} onSubmit={handleSubmit}>
        {eMessage === true ? <span style={{color: 'red'}}>You need a valid name and value!</span> : null}
        <div>
          <label htmlFor="name">Name*</label>
          <input 
            id="name" 
            type="text" 
            value={newTaskName || ''} 
            onChange={(e) => setNewTaskName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="details">Details</label>
          <input 
            id="details" 
            type="text" 
            value={newTaskDetails || ''} 
            onChange={(e) => setNewTaskDetails(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="value">Value*</label>
          <input 
            id="value" 
            type="number"
            min="0" 
            value={newTaskValue || ''} 
            onChange={(e) => setNewTaskValue(Number(e.target.value))}
          />
        </div>
        <button className='button block primary' type="submit">Add Task +</button>
      </form>
    )
  }

  function handleTablesScreen() {
    if (!tasks) {
      return
    }

    function apprBtn(tkey) {
      if (role === 'provider') {
        return <button className='button primary' onClick={() => {
          alert("Task approved!")
          approveTask(tkey)
          setRefresh(!refresh)
        }}>Approve Task</button>
      } else {
        return <p>Waiting on Approval</p>
      }
    }

    function delBtn(tkey) {
      if (role === 'receiver') {
        return <button className='button' style={{backgroundColor: 'red'}} onClick={() => {
          alert("Task deleted.")
          deleteTask(tkey)
          setRefresh(!refresh)
        }}>Delete Task</button>
      } else {
        return null
      }
    }

    function complBtn(item) {
      if (role === 'provider' && item.prov_completion_status) {
        return "Waiting on completion"
      } else if (role === 'receiver' && item.rec_completion_status) {
        return "Waiting on completion"
      }
      return (
        <button className='button primary' onClick={() => {
          alert("Task completed on your side!")
          setRefresh(!refresh)
          completeTask(item.id, role)
        }}>
          {role === 'provider' ? 'Complete' : 'I Received Payment'}
        </button>
      )
    }

    const reqAppr = tasks.filter(item => item.status === "Needs Approval")
    const wip = tasks.filter(item => item.status === "In Progress")
    const closed = tasks.filter(item => item.status === "Closed")

    return (
      <div className='container'>
        <div className='row' style={{height: '50vh'}}>
          <div className='col-4'>
            <h3>Requires Approval</h3>
            {reqAppr.map((item) => {
              return (
                <div className='card' key={item.id}>
                  <div className='card-body'>
                    <h3 className='card-title'>{item.name} ${item.value}</h3>
                    <p className='card-text'>{item.details ? item.details: "No description"}</p>
                    {apprBtn(item.id)} {delBtn(item.id)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className='col-4'>
            <h3>In Progress</h3>
            {wip.map((item) => {
              return (
                <div className='card' key={item.id}>
                  <div className='card-body'>
                    <h3 className='card-title'>{item.name} ${item.value}</h3>
                    <p className='card-text'>{item.details ? item.details: "No description"}</p>
                    {complBtn(item)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className='col-4'>
            <h3>Complete</h3>
            {closed.map((item) => {
              return (
                <div className='card' key={item.id}>
                  <div className='card-body'>
                    <h3 className='card-title'>{item.name} ${item.value}</h3>
                    <p className='card-text'>{item.details ? item.details: "No description"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )

  }

  return (
      <div>
        <div>Hi {username}! You are a {role}.</div>
        {handleAssociateScreen()}
        <br/>
        {handleAddTaskScreen()}
        
        {handleTablesScreen()}
        <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
  )
}