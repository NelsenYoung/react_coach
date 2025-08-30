import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaArchive, FaTrash } from 'react-icons/fa';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);


function App() {
  const [goals, setGoals] = useState([]);
  const [tempGoal, setTempGoal] = useState("");
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [archiveGoals, setArchiveGoals] = useState([]);

  useEffect(() => {
    getGoals();
  }, []);


  async function getGoals() {
    const { data } = await supabase.from("goals").select();
    setGoals(data);
  }

  async function getGoal(id){
    const { data } = await supabase.from("goals").select().eq('id', id);
    return data;
  }

  async function getArchiveGoals(){
    const { data } = await supabase.from("goal_archive").select();
    setArchiveGoals(data);
    return data;
  }

  async function addGoal() {
    if(!tempGoal) return;
    const newEntry = {user_id: null, text: tempGoal}
    const { data, error } = await supabase.from("goals").insert([newEntry]).select();

    if (error) {
      console.error(error);
      return;
    }

    setGoals(prevGoals => [...prevGoals, ...data]);
    setTempGoal("");
    setCreatingGoal(false);
  }

  async function deleteGoal(id) {
    const { data , error} = await supabase.from("goals").delete().eq('id', id).select();

    if (error){
      console.error(error);
      return;
    }

    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
  }

  async function archiveGoal(id){
    const goal = getGoal(id);
    console.log(goal);

    // Insert the goal into the archive table
    const { data, error } = await supabase.from("goal_archive").insert([goal]).select();

    if (error){
      console.error(error);
      return;
    }
    setArchiveGoals(prevArchiveGoals => [...prevArchiveGoals, ...data]);

    // remove from the current table
    deleteGoal(id);
  }

  const change = event => {
    setTempGoal(event.target.value);
  }

  const buttonChange = event => {
    if(creatingGoal){
      setCreatingGoal(false);
    }else{
      setCreatingGoal(true);
    }
  }

    return (
  <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 drop-shadow-lg">Goals</h1>
  <ul className="w-full max-w-2xl space-y-3 mb-6 px-2">
          {goals.map((goal) => (
            <li key={goal.id} className="flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition">
              <span className="text-lg text-gray-800">{goal.text}</span>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                aria-label="Delete goal"
              >
                <FaTrash />
              </button>
              <button
                onClick={() => archiveGoal(goal.id)}
                className="ml-4 bg-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition"
                aria-label="Archive goal"
              >
                <FaArchive />
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={buttonChange}
          className="mb-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          {creatingGoal ? "Cancel" : "Create Goal"}
        </button>

        {creatingGoal && (
          <form
            className="w-full max-w-2xl flex gap-2 px-2"
            onSubmit={e => {
              e.preventDefault();
              addGoal();
            }}
          >
            <input
              type="text"
              value={tempGoal}
              onChange={change}
              placeholder="Enter a Goal"
              autoFocus
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
            >
              Add
            </button>
          </form>
        )}
      </div>
    );
}

export default App;