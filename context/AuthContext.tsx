'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { arrayUnion, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType { // we create the AuthContextType interface
    user: any; // we create the user state
    login: (userData: any) => void; // we create the login function
    logout: () => void; // we create the logout function
    createUser: (user: any) => void; // we create the createUser function
    createNewList: (listData: any) => void; // we create the createNewList function
    getTasksData: (task_id: string) => void; // we create the getTasksData function
    subscribeToTasks: (task_id: string, callback: (data: any) => void) => void; // we create the subscribeToTasks function
    markTaskAsComplete: (task_id: string, task_id_to_update: string) => void; // we create the markTaskAsComplete function
    createNewTask: (taskData: any, task_id: string) => void; // we create the createNewTask function
    deleteList: (task_id: string) => void; // we create the deleteList function
    userData: any; // we create the userData state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // we create the context

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null); // we create the user state, this is from the authentication
    const [userData, setUserData] = useState<any>(null); // we create the userData state, this is from the database
    const router = useRouter(); // we need the router to redirect the user

    const createUser = async (userData: any) => {
        await createUserWithEmailAndPassword(auth, userData.email, userData.password); // we create the user
        
        if (auth.currentUser) { // if the user is created successfully
            const user_doc = doc(db, 'users', auth.currentUser.uid); // we get the user document
            const user = await getDoc(user_doc); // we get the user data

            if (!user.exists()) { // if the user doesn't exist
                await setDoc(user_doc, { // we create the user document
                    uid: auth.currentUser.uid,
                    email: userData.email,
                    displayName: userData.displayName,
                });

                await createNewList({ title: 'My First List', emoji: '📝' }); // we create the first list
                
            }
        } else {
            throw new Error('No authenticated user found'); // if the user is not created successfully, we throw an error
        }
    }

    const createNewList = async (listData: any) => { // we create a new list
        if (auth.currentUser) { // if the user is authenticated
            const user_doc = doc(db, 'users', auth.currentUser.uid); // we get the user document
            const user = await getDoc(user_doc); // we get the user data
            const TASK_ID = uuidv4(); // we create a new task id
            const task_doc = doc(db, 'tasks', TASK_ID); // we get the task document

            if (user.exists()) { // if the user exists
                await updateDoc(user_doc, { // we update the user document
                    taskList: arrayUnion({ 
                        id: TASK_ID, 
                        title: listData.title, 
                        emoji: listData.emoji, 
                        task_count: 0 
                    }),
                });

                await setDoc(task_doc, { // we create the task document
                    id: TASK_ID,
                    title: listData.title,
                    emoji: listData.emoji,
                    task_count: 0,
                    tasks: [],
                });

                router.push(`/task/${TASK_ID}`); // we redirect the user to the new list
            }
        } else {
            throw new Error('No authenticated user found'); // if the user is not authenticated, we throw an error
        }
    }

    const getTasksData = async (task_id: any) => { // we get the tasks data
        const task_doc = doc(db, 'tasks', task_id); // we get the task document
        const task = await getDoc(task_doc);  // we get the task data

        if (task.exists()) { // if the task exists
            return task.data(); // we return the task data
        } else {
            return; // if the task doesn't exist, we return nothing
        }
    }


    const subscribeToTasks = (task_id: string, callback: (data: any) => void) => { // we subscribe to the tasks
        const task_doc = doc(db, 'tasks', task_id); // we get the task document
        return onSnapshot(task_doc, (doc) => { // we subscribe to the task document
            if (doc.exists()) { // if the task exists
                callback(doc.data()); // we call the callback with the task data
            } else { // if the task doesn't exist
                console.error('No task found'); // we log an error
            }
        });
    };

    const createNewTask = async (taskData: any, task_id: string) => { // we create a new task
        if (!auth.currentUser) { // if the user is not authenticated
            throw new Error('No authenticated user found');
        }
        console.log(taskData, task_id); // we log the task data and the task id
        const task_doc = doc(db, 'tasks', task_id); // we get the task document
        const task = await getDoc(task_doc); 
        const user_doc = doc(db, 'users', auth.currentUser.uid); // we get the user document
        const user = await getDoc(user_doc);

        if (task.exists()) { // if the task exists
            await updateDoc(task_doc, { // we update the task document
                tasks: arrayUnion({  
                    id: uuidv4(), 
                    title: taskData.title, 
                    completed: false,
                    completeByTimestamp: taskData.completeByTimestamp,
                    emoji: taskData.emoji,
                    parentTaskId: task_id,
                }),
            });

            await updateDoc(user_doc, { // we update the user document
                taskList: user.data()?.taskList?.map((task: any) => { 
                    if (task.id === task_id) { // if the task id matches
                        return { ...task, task_count: task.task_count + 1 }; // we update the task count
                    } else {
                        return task;
                    }
                }),
            });

        } else {
            throw new Error('No task found');
        }
    }

    const markTaskAsComplete = async (task_id: string, task_id_to_update: string) => {
        if (!auth.currentUser) { // if the user is not authenticated
            throw new Error('No authenticated user found');
        }

        const task_doc = doc(db, 'tasks', task_id); // we get the task document
        const user_doc = doc(db, 'users', auth.currentUser.uid);
        const user = await getDoc(user_doc); // we get the user data
        const task = await getDoc(task_doc);

        if (task.exists()) { // if the task exists
            const taskData = task.data(); // we get the task data
            const updatedTasks = taskData.tasks.map((t: any) => { // we update the tasks
                if (t.id === task_id_to_update) { // if the task id matches
                    return { 
                        ...t, 
                        completed: !t.completed,
                        completedAt: !t.completed ? Date.now() : null,
                    }; // we update the task
                } else {
                    return t; // if the task id doesn't match, we return the task
                }
            });
 
            await updateDoc(task_doc, { tasks: updatedTasks }); // we update the task document

            const updatedTaskList = user.data()?.taskList?.map((t: any) => { // we update the task list
                if (t.id === task_id) { // if the task id matches
                    const completedTasks = updatedTasks.filter((task: any) => task.completed).length; // we get the completed tasks
                    const outstandingTasks = updatedTasks.length - completedTasks; // we get the outstanding tasks
                    return { 
                        ...t, 
                        task_count: outstandingTasks, 
                        completed_count: completedTasks,
                    };
                } else { // if the task id doesn't match
                    return t;
                }
            });

            await updateDoc(user_doc, { taskList: updatedTaskList }); // we update the user document
        } else {
            throw new Error('No task found'); // if the task doesn't exist, we throw an error
        }
    }

    const deleteList = async (task_id: string) => { // we delete the list
        if (!auth.currentUser) { // if the user is not authenticated
            throw new Error('No authenticated user found'); // we throw an error
        }

        const task_doc = doc(db, 'tasks', task_id); // we get the task document
        const user_doc = doc(db, 'users', auth.currentUser.uid); // we get the user document
        const user = await getDoc(user_doc);
        const task = await getDoc(task_doc);

        if (task.exists()) { // if the task exists
            await updateDoc(user_doc, { // we update the user document
                taskList: user.data()?.taskList?.filter((t: any) => t.id !== task_id),
            });

            await deleteDoc(task_doc); // we delete the task document
        } else {
            throw new Error('No task found');
        }
    }

    const login = async (userData: any) => { // we login the user
        try {
            await signInWithEmailAndPassword(auth, userData.email, userData.password); // we sign in the user
            router.push('/'); // we redirect the user to the home page
        } catch (error) {
            toast.error('Unkown error signing in'); // incorrect email or password, but they'll never know heehheehhehehe
            console.error('Error signing in: ', error); // those who know, will know...
        }
    };

    const logout = () => { // we logout the user
        signOut(auth);
        router.push('/auth/login');
    };

    useEffect(() => { // we use an effect to check if the user is authenticated
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            setUser(user);
    
            if (user) { // if the user is authenticated
                const userDocRef = doc(db, 'users', user.uid); // we get the user document
    
                try {
                    const userDoc = await getDoc(userDocRef); // we get the user data
                    setUserData(userDoc.data()); // we set the user data
                } catch (error) { 
                    console.error("Error fetching user data: ", error);
                }
    
                const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                    setUserData(doc.data()); // we set the user data
                });
    
                return () => unsubscribeSnapshot(); // we return the unsubscribe function
            } else {
                router.push('/landing'); // if the user is not authenticated, we redirect them to the register page
                setUserData(null); // we set the user data to null
            }
        });
    
        return () => unsubscribeAuth(); // we return the unsubscribe function
    }, []);

    // this is the exports object, we use this to export the functions and states
    const exports = { user, login, logout, userData, createUser, createNewList, getTasksData, subscribeToTasks, createNewTask, markTaskAsComplete, deleteList }; 

    return ( // we return the AuthContext.Provider with the exports object as the value
        <AuthContext.Provider value={exports}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { // we create a custom hook to use the AuthContext
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};