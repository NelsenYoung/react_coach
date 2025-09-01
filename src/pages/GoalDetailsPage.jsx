import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";
import { FaTrash } from 'react-icons/fa';

export default function GoalDetailsPage() {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [dailyActions, setActions] = useState([]);
  const [tempAction, setTempAction] = useState("");
  const [creatingAction, setCreatingAction] = useState(false);

  useEffect(() => {
    async function fetchGoal() {
      const { data, error } = await supabase.from("goals").select().eq("id", id).single();

      if (error) {
        console.error(error);
        return;
      }
      setGoal(data);
    }
    fetchGoal();
    getActions();
  }, [id]);

  async function getActions() {
    const num_id = parseInt(id);
    const { data, error } = await supabase.from("goal_actions").select().eq("goal_id", num_id);

    if(error){
      console.log(error);
      return;
    }
    setActions(data);
  }

  async function addAction() {
    if (!tempAction) return;
    const newEntry = { goal_id: parseInt(id), text: tempAction };
    const { data, error } = await supabase.from("goal_actions").insert([newEntry]).select();

    if (error) {
      console.error(error);
      return;
    }

    setActions(prevActions => [...prevActions, ...data]);
    setTempAction("");
    setCreatingAction(false);
  }

  async function deleteAction(id) {
    const { error } = await supabase.from("goal_actions").delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setActions(prevActions => prevActions.filter(action => action.id !== id));
  }

  const change = event => {
    setTempAction(event.target.value);
  }

  const buttonChange = event => {
    if (creatingAction) {
      setCreatingAction(false);
    } else {
      setCreatingAction(true);
    }
  }

  if (!goal) return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow p-6 max-w-md flex items-center justify-center">
        <span className="text-lg text-gray-700">Loading goal...</span>
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">{goal.text}</h1>
      <div className="w-full max-w-2xl">
        <ul className="space-y-3">
          {dailyActions.map((action) => (
            <li key={action.id}>
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition">
                <span className="text-lg text-gray-800">{action.text}</span>
                <button
                  onClick={() => deleteAction(action.id)}
                  className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                  aria-label="Delete action"
                  type="button"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={buttonChange}
  className="my-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
      >
        {creatingAction ? "Cancel" : "Create Daily Action"}
      </button>

      {creatingAction && (
        <form
          className="w-full max-w-2xl flex gap-2 px-2"
          onSubmit={e => {
            e.preventDefault();
            addAction();
          }}
        >
          <input
            type="text"
            value={tempAction}
            onChange={change}
            placeholder="Enter a Daily Action"
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
