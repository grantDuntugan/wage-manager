import { uploadUser } from "./functions"

function FTReg({ setPageState, user }) {
    function handleSubmit(e) {
        uploadUser(user, e.target.value)
        setPageState(1)
    }

    return (
        <div>
            <span>I am a...</span>
            <div>
                <button value={'provider'} onClick={(e) => handleSubmit(e)}>Provider</button>
                <button value={'receiver'} onClick={(e) => handleSubmit(e)}>Receiver</button>
            </div>
        </div>
    )
}

export default FTReg