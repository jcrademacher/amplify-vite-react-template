import { useContext, createContext, useState, ReactNode } from 'react';

interface FileStateInterface {
    saving: boolean,
    setSaving: (state: boolean) => void,
    savedAt: moment.Moment | undefined,
    setSavedAt: (state: moment.Moment | undefined) => void
}

const FileStateContext = createContext<FileStateInterface>({
    saving: false,
    setSaving: (state: boolean) => {},
    savedAt: undefined,
    setSavedAt: (state: moment.Moment | undefined) => {}
})

export function FileContextProvider({children}: {children: ReactNode}) {
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<moment.Moment | undefined>(undefined);

    return (
        <FileStateContext.Provider value={{
            saving: saving,
            setSaving: setSaving,
            savedAt: savedAt,
            setSavedAt: setSavedAt
        }}>
            {children}
        </FileStateContext.Provider>
    )
}

export const useFileContext = () => {
    return useContext(FileStateContext);
}