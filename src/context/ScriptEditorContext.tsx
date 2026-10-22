'use client';

import { createContext, useContext } from 'react';

interface ScriptEditorContextValue {
  requestEdit: () => void;
  registerEditor: (handler: () => void) => () => void;
}

const ScriptEditorContext = createContext<ScriptEditorContextValue>({
  requestEdit: () => undefined,
  registerEditor: () => () => undefined,
});

export const ScriptEditorProvider = ScriptEditorContext.Provider;
export const useScriptEditor = () => useContext(ScriptEditorContext);
