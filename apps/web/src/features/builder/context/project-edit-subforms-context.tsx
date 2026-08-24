'use client';

import type {
  BankPartnerOfferTemplateItem,
  ProjectBankPartnerOfferItem,
  UpdateProjectBankPartnerOfferBody,
} from '@toonexpo/contracts';
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

import {
  templateIdFromPendingBankPartnerOfferId,
} from '@/features/builder/utils/pending-bank-partner-offer';

export type ProjectEditSubFormRegistration = {
  id: string;
  isDirty: boolean;
  isPendingImport?: boolean;
  save: () => Promise<void>;
  getValues?: () => Promise<UpdateProjectBankPartnerOfferBody>;
};

type OfferSaveAdapters = {
  applyTemplates: (templateIds: string[]) => Promise<ProjectBankPartnerOfferItem[]>;
  updateOffer: (
    offerId: string,
    body: UpdateProjectBankPartnerOfferBody,
  ) => Promise<unknown>;
};

type ProjectEditSubFormsContextValue = {
  setEntry: (entry: ProjectEditSubFormRegistration) => void;
  removeEntry: (id: string) => void;
  hasUnsavedOfferChanges: boolean;
  isSavingSubForms: boolean;
  saveAllOfferChanges: () => Promise<void>;
  pendingImportTemplates: BankPartnerOfferTemplateItem[];
  stagePendingImports: (templates: BankPartnerOfferTemplateItem[]) => void;
  unstagePendingImport: (templateId: string) => void;
  isPendingImportTemplate: (templateId: string) => boolean;
};

const ProjectEditSubFormsContext = createContext<ProjectEditSubFormsContextValue | null>(
  null,
);

type ProjectEditSubFormsProviderProps = {
  children: ReactNode;
  offerSaveAdapters: OfferSaveAdapters;
};

/**
 * Tracks nested edit surfaces and staged bank partner imports for the project save bar.
 */
export const ProjectEditSubFormsProvider = ({
  children,
  offerSaveAdapters,
}: ProjectEditSubFormsProviderProps) => {
  const entriesRef = useRef(new Map<string, ProjectEditSubFormRegistration>());
  const offerSaveAdaptersRef = useRef(offerSaveAdapters);
  offerSaveAdaptersRef.current = offerSaveAdapters;

  const [version, setVersion] = useState(0);
  const [isSavingSubForms, setIsSavingSubForms] = useState(false);
  const [pendingImportTemplates, setPendingImportTemplates] = useState<
    BankPartnerOfferTemplateItem[]
  >([]);

  const bump = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const setEntry = useCallback(
    (entry: ProjectEditSubFormRegistration) => {
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

  const stagePendingImports = useCallback(
    (templates: BankPartnerOfferTemplateItem[]) => {
      if (templates.length === 0) {
        return;
      }
      setPendingImportTemplates((current) => {
        const known = new Set(current.map((template) => template.id));
        const next = [...current];
        for (const template of templates) {
          if (!known.has(template.id)) {
            next.push(template);
          }
        }
        return next;
      });
      bump();
    },
    [bump],
  );

  const unstagePendingImport = useCallback(
    (templateId: string) => {
      setPendingImportTemplates((current) =>
        current.filter((template) => template.id !== templateId),
      );
      bump();
    },
    [bump],
  );

  const isPendingImportTemplate = useCallback(
    (templateId: string) =>
      pendingImportTemplates.some((template) => template.id === templateId),
    [pendingImportTemplates],
  );

  const hasUnsavedOfferChanges = useMemo(() => {
    void version;
    if (pendingImportTemplates.length > 0) {
      return true;
    }
    for (const entry of entriesRef.current.values()) {
      if (entry.isDirty) {
        return true;
      }
    }
    return false;
  }, [pendingImportTemplates.length, version]);

  const saveAllOfferChanges = useCallback(async () => {
    const entries = [...entriesRef.current.values()];
    const pendingEntries = entries.filter((entry) => entry.isPendingImport);
    const dirtyExistingEntries = entries.filter(
      (entry) => entry.isDirty && !entry.isPendingImport,
    );

    if (pendingEntries.length === 0 && dirtyExistingEntries.length === 0) {
      return;
    }

    setIsSavingSubForms(true);
    try {
      if (pendingEntries.length > 0) {
        const payloads = await Promise.all(
          pendingEntries.map(async (entry) => ({
            templateId: templateIdFromPendingBankPartnerOfferId(entry.id),
            values: await entry.getValues?.(),
          })),
        );
        const templateIds = payloads.map((payload) => payload.templateId);
        const createdOffers =
          await offerSaveAdaptersRef.current.applyTemplates(templateIds);
        setPendingImportTemplates([]);

        await Promise.all(
          payloads.map(async (payload) => {
            if (payload.values == null) {
              return;
            }
            const created = createdOffers.find(
              (offer) => offer.templateId === payload.templateId,
            );
            if (created == null) {
              return;
            }
            await offerSaveAdaptersRef.current.updateOffer(created.id, payload.values);
          }),
        );
      }

      const refreshedDirtyEntries = [...entriesRef.current.values()].filter(
        (entry) => entry.isDirty && !entry.isPendingImport,
      );
      await Promise.all(refreshedDirtyEntries.map((entry) => entry.save()));
    } finally {
      setIsSavingSubForms(false);
      bump();
    }
  }, [bump]);

  const value = useMemo(
    (): ProjectEditSubFormsContextValue => ({
      setEntry,
      removeEntry,
      hasUnsavedOfferChanges,
      isSavingSubForms,
      saveAllOfferChanges,
      pendingImportTemplates,
      stagePendingImports,
      unstagePendingImport,
      isPendingImportTemplate,
    }),
    [
      hasUnsavedOfferChanges,
      isPendingImportTemplate,
      isSavingSubForms,
      pendingImportTemplates,
      removeEntry,
      saveAllOfferChanges,
      setEntry,
      stagePendingImports,
      unstagePendingImport,
    ],
  );

  return (
    <ProjectEditSubFormsContext.Provider value={value}>
      {children}
    </ProjectEditSubFormsContext.Provider>
  );
};

export const useProjectEditSubForms = (): ProjectEditSubFormsContextValue => {
  const context = useContext(ProjectEditSubFormsContext);
  if (context == null) {
    throw new Error('useProjectEditSubForms must be used within ProjectEditSubFormsProvider');
  }
  return context;
};

/**
 * Registers a nested sub-form with the project save bar (dirty tracking + save hook).
 */
export const useRegisterProjectEditSubForm = (
  registration: ProjectEditSubFormRegistration,
): void => {
  const { setEntry, removeEntry } = useProjectEditSubForms();
  const saveRef = useRef(registration.save);
  saveRef.current = registration.save;
  const getValuesRef = useRef(registration.getValues);
  getValuesRef.current = registration.getValues;

  useEffect(() => {
    setEntry({
      id: registration.id,
      isDirty: registration.isDirty,
      isPendingImport: registration.isPendingImport,
      save: () => saveRef.current(),
      getValues: getValuesRef.current
        ? () => getValuesRef.current!()
        : undefined,
    });
  }, [
    registration.id,
    registration.isDirty,
    registration.isPendingImport,
    setEntry,
  ]);

  useEffect(() => {
    return () => removeEntry(registration.id);
  }, [registration.id, removeEntry]);
};
