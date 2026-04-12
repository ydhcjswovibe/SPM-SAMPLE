"use client";

import { createContext, useContext } from "react";

const defaultStudentUserName = "학생";

const StudentUserNameContext = createContext(defaultStudentUserName);

interface StudentUserNameProviderProps {
    children: React.ReactNode;
    userName: string;
}

export function StudentUserNameProvider({
    children,
    userName,
}: StudentUserNameProviderProps) {
    const resolvedUserName = userName.trim() || defaultStudentUserName;

    return (
        <StudentUserNameContext.Provider value={resolvedUserName}>
            {children}
        </StudentUserNameContext.Provider>
    );
}

export function useStudentUserName() {
    return useContext(StudentUserNameContext);
}
