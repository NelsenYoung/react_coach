import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";
import { TbRestore } from 'react-icons/tb';

const Archive = () => {
    const [archiveGoals, setArchiveGoals] = useState([]);
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        getArchiveGoals();
    }, []);

    async function getArchiveGoals() {
        const { data, error} = await supabase.from("goal_archive").select();

        if(error){
            console.log(error);
            return;
        }

        setArchiveGoals(data);
    }

    async function getGoal(id){
        const { data } = await supabase.from("goal_archive").select().eq('id', id);
        return data;
    }

    async function addGoal(id) {
        const goal = await getGoal(id);
        const row = goal[0];
        const { data, error } = await supabase.from("goals").insert([row]).select();

        if (error) {
            console.error(error);
            return;
        }

        setGoals(prevGoals => [...prevGoals, ...data]);
    }

    async function deleteGoal(id, table) {
        const { data , error} = await supabase.from(table).delete().eq('id', id).select();

        if (error){
            console.error(error);
            return;
        }
        if(table == "goals"){
            setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
        }else{
            setArchiveGoals(prevArchiveGoals => prevArchiveGoals.filter(goal => goal.id !== id));
        }
    }

    async function UnArchiveGoal(id) {
        // First add to goals
        await addGoal(id);
        // Then delete
        await deleteGoal(id, "goal_archive");
    }

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-blue-700 mb-6 drop-shadow-lg"> Archived Goals</h1>
            <ul className="w-full max-w-2xl space-y-3 mb-6 px-2">
                {archiveGoals.map((goal) => (
                <li key={goal.id} className="flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition">
                    <span className="text-lg text-gray-800">{goal.text}</span>
                    <button
                    onClick={() => UnArchiveGoal(goal.id)}
                    className="ml-4 bg-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition"
                    aria-label="Unarchive goal"
                    >
                    <TbRestore />
                    </button>
                </li>
                ))}
            </ul>
        </div>
    )
}

export default Archive;