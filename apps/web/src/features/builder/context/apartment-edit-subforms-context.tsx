'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ApartmentEditSubFormRegistration = {
  id: string;
  isDirty: boolean;
  save: () => Promise<void>;
};

type ApartmentEditSubFormsContextValue = {
  setEntry: (entry: ApartmentEditSubFormRegistration) => void;
  removeEntry: (id: string) => void;
  hasUnsavedChanges: boolean;
  isSavingSubForms: boolean;
  saveAllChanges: () => Promise<void>;
};

const ApartmentEditSubFormsContext = createContext<ApartmentEditSubFormsContextValue | null>(
  null,
);

type ApartmentEditSubFormsProviderProps = {
  children: ReactNode;
};

/**
 * Tracks nested apartment media editors for the shared bottom save bar.
 */
export const ApartmentEditSubFormsProvider = ({
  children,
}: ApartmentEditSubFormsProviderProps) => {
  const entriesRef = useRef(new Map<string, ApartmentEditSubFormRegistration>());
  const [version, setVersion] = useState(0);
  const [isSavingSubForms, setIsSavingSubForms] = useState(false);

  const bump = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const setEntry = useCallback(
    (entry: ApartmentEditSubFormRegistration) => {
      entriesRef.current.set(entry.id, entry);
      bump();
    },
    [bump],
  );

  const removeEntry = useCallback(
    (id: string) => {
      entriesRef.current.delete(id);
      bump();
    },
    [bump],
  );

  const hasUnsavedChanges = useMemo(() => {
    void version;
    for (const entry of entriesRef.current.values()) {
      if (entry.isDirty) {
        return true;
      }
    }
    return false;
  }, [version]);

  const saveAllChanges = useCallback(async () => {
    const dirtyEntries = [...entriesRef.current.values()].filter((entry) => entry.isDirty);
    if (dirtyEntries.length === 0) {
      return;
    }

    setIsSavingSubForms(true);
    try {
      // Sequential: several editors PATCH the same apartment row.
      for (const entry of dirtyEntries) {
        await entry.save();
      }
    } finally {
      setIsSavingSubForms(false);
      bump();
    }
  }, [bump]);

  const value = useMemo(
    (): ApartmentEditSubFormsContextValue => ({
      setEntry,
      removeEntry,
      hasUnsavedChanges,
      isSavingSubForms,
      saveAllChanges,
    }),
    [hasUnsavedChanges, isSavingSubForms, removeEntry, saveAllChanges, setEntry],
  );

  return (
    <ApartmentEditSubFormsContext.Provider value={value}>
      {children}
    </ApartmentEditSubFormsContext.Provider>
  );
};

export const useApartmentEditSubForms = (): ApartmentEditSubFormsContextValue => {
  const context = useContext(ApartmentEditSubFormsContext);
  if (context == null) {
    throw new Error(
      'useApartmentEditSubForms must be used within ApartmentEditSubFormsProvider',
    );
  }
  return context;
};

/**
 * Registers a nested sub-form with the apartment save bar (dirty tracking + save hook).
 */
export const useRegisterApartmentEditSubForm = (
  registration: ApartmentEditSubFormRegistration,
): void => {
  const { setEntry, removeEntry } = useApartmentEditSubForms();
  const saveRef = useRef(registration.save);
  saveRef.current = registration.save;

  useEffect(() => {
    setEntry({
      id: registration.id,
      isDirty: registration.isDirty,
      save: () => saveRef.current(),
    });
  }, [registration.id, registration.isDirty, setEntry]);

  useEffect(() => {
    return () => removeEntry(registration.id);
  }, [registration.id, removeEntry]);
};
