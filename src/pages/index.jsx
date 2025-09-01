import { useEffect, useState } from "react";
import { FaArchive, FaTrash } from 'react-icons/fa';
import { supabase } from "../components/supabaseClient";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [goals, setGoals] = useState([]);
    const [tempGoal, setTempGoal] = useState("");
    const [creatingGoal, setCreatingGoal] = useState(false);
    const [archiveGoals, setArchiveGoals] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getGoals();
    }, []);

    async function getGoals() {
        const { data } = await supabase.from("goals").select();
        console.log(data);
        setGoals(data);
    }

    async function getGoal(id) {
        const { data } = await supabase.from("goals").select().eq('id', id);
        return data;
    }

    async function getArchiveGoals() {
        const { data } = await supabase.from("goal_archive").select();
        setArchiveGoals(data);
        return data;
    }

    async function addGoal() {
        if (!tempGoal) return;
        const newEntry = { user_id: null, text: tempGoal };
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
        const { data, error } = await supabase.from("goals").delete().eq('id', id).select();

        if (error) {
            console.error(error);
            return;
        }

        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
    }

    async function archiveGoal(id) {
        const goal = await getGoal(id);
        const row = goal[0];

        // Insert the goal into the archive table
        const { data, error } = await supabase.from("goal_archive").insert([row]).select();

        if (error) {
            console.error(error);
            return;
        }
        setArchiveGoals(prevArchiveGoals => [...prevArchiveGoals, ...data]);

        // remove from the current table
        await deleteGoal(id);
    }

    const change = event => {
        setTempGoal(event.target.value);
    }

    const buttonChange = event => {
        if (creatingGoal) {
            setCreatingGoal(false);
        } else {
            setCreatingGoal(true);
        }
    }

    return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 drop-shadow-lg">Goals</h1>
    <ul className="w-full max-w-2xl space-y-3 mb-6 px-2">
            {goals.map((goal) => (
                <li key={goal.id}>
                    <div
                        className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition text-left cursor-pointer"
                        onClick={() => navigate(`/goal/${goal.id}`)} // Add a card click handler if needed
                    >
                        <span className="text-lg text-gray-800">{goal.text}</span>
                        <span className="flex gap-2">
                            <button
                                onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                                aria-label="Delete goal"
                                type="button"
                            >
                                <FaTrash />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); archiveGoal(goal.id); }}
                                className="bg-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition"
                                aria-label="Archive goal"
                                type="button"
                            >
                                <FaArchive />
                            </button>
                        </span>
                    </div>
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

export default Home;