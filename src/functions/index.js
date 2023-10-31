import { supabase } from '../supabaseClient'

export async function checkUserExists(user) {
    if (!user) {
        return null
    }

    let { data: Users, error } = await supabase
    .from('Users')
    .select('uid')
    .eq('uid', user.id)

    if (error) {
        console.error(error)
        return -1
    }
    else
        return Users
}

export async function uploadUser(user, role) {
    const { data, error } = await supabase
        .from('Users')
        .insert([
            { uid: user.id, username: user.email.split('@')[0], role, associate: null },
        ])
        .select()
    
    if (error) {
        console.error(error)
        return -1
    } else {
        console.log("success:", data)
        return 0
    }
}

export async function getUserDetails(user) {
    let { data: userData, error } = await supabase
        .from('Users')
        .select('*')
        .eq('uid', user.id)
    if (error) {
        console.error("something went wrong", error)
        return null
    } else {
        return userData
    }
}

export async function getPossibleAssociates(user) { 
    let { data: users, error } = await supabase
        .from('Users')
        .select('*')
        .neq('username', user.username)
        .neq('role', user.role)
        .is('associate', null)
    if (error) {
        console.error("something went wrong", error)
        return null
    } else {
        return users
    }
}

export async function updateAssociate(user, uid) {
    await supabase
        .from('Users')
        .update({ associate : uid })
        .eq('uid', user.id)
        .select()

    await supabase
        .from('Users')
        .update({ associate : user.id })
        .eq('uid', uid)
        .select()
}

export async function getUsername(uid) {
    let {data: userData, error} = await supabase
        .from('Users')
        .select('username')
        .eq('uid', uid)
    
    return userData[0].username
}

export async function uploadTask(data) {
    const { d, error } = await supabase
        .from('Tasks')
        .insert([
        { 
            name: data.name,
            details: data.details,
            status: "Needs Approval",
            provider: data.provider,
            receiver: data.receiver,
            value: data.value
        },
        ])
        .select()
    
    if (error) {
        console.log(error)
    } else {
        alert("Task uploaded!")
    }

}

export async function getTasks(user) {
    let { data: tasks, error } = await supabase
        .from('Tasks')
        .select('*')
        .or(`provider.eq.${user.id},receiver.eq.${user.id}`)
    
    if (error) {
        console.log(error)
    } else {
        return tasks
    }

}

export async function approveTask(tkey) {
    const { data, error } = await supabase
        .from('Tasks')
        .update({ status : 'In Progress' })
        .eq('id', tkey)
        .select()

    if (error) {
        console.log(error)
    }
}

export async function deleteTask(tkey) {    
    const { error } = await supabase
        .from('Tasks')
        .delete()
        .eq('id', tkey)

    if (error) {
        console.log(error)
    }
}

export async function completeTask(tkey, role) {
    console.log('i ran')
    if (role === 'provider') {
        const { data, error } = await supabase
            .from('Tasks')
            .update({ prov_completion_status: true })
            .eq('id', tkey)
            .select()
    } else {
        const { data, error } = await supabase
            .from('Tasks')
            .update({ rec_completion_status: true })
            .eq('id', tkey)
            .select()
    }

    let { data: provStat, e1 } = await supabase
      .from('Tasks')
      .select('prov_completion_status')
      .eq('id', tkey)
    let { data: recStat, e2 } = await supabase
      .from('Tasks')
      .select('rec_completion_status')
      .eq('id', tkey)
    
    if (provStat[0].prov_completion_status && recStat[0].rec_completion_status) {
        const { data, error } = await supabase
            .from('Tasks')
            .update({ status: 'Closed' })
            .eq('id', tkey)
            .select()
    }
}
