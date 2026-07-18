"use client";

import type { CrmDealDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { listPortalApartments } from "@/features/builder/api/portal-apartments-api";
import { PORTAL_MAX_PAGE_SIZE } from "@/features/builder/constants";
import {
  useAttachDealApartmentMutation,
  useDetachDealApartmentMutation,
} from "@/features/builder/hooks/use-portal-crm";
import {
  usePortalProjectQuery,
  usePortalProjectsQuery,
} from "@/features/builder/hooks/use-portal-projects";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

type CrmDealApartmentsSectionProps = {
  deal: CrmDealDetail;
};

type ApartmentOption = { id: string; label: string };

/**
 * Linked apartments with attach/detach via dedicated deal apartment endpoints.
 */
export const CrmDealApartmentsSection = ({
  deal,
}: CrmDealApartmentsSectionProps) => {
  const t = useTranslations("Builder.crm.detail");
  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const attachMutation = useAttachDealApartmentMutation(deal.id);
  const detachMutation = useDetachDealApartmentMutation(deal.id);
  const [projectId, setProjectId] = useState(deal.projectId ?? "");
  const [apartmentId, setApartmentId] = useState("");
  const [apartments, setApartments] = useState<ApartmentOption[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const projectQuery = usePortalProjectQuery(projectId);

  useEffect(() => {
    const project = projectQuery.data;
    if (!projectId || !project) {
      setApartments([]);
      return;
    }
    const floorIds = project.buildings.flatMap((building) =>
      building.floors.map((floor) => floor.id),
    );
    if (floorIds.length === 0) {
      setApartments([]);
      return;
    }

    let cancelled = false;
    setLoadingApartments(true);
    void (async () => {
      try {
        const lists = await Promise.all(
          floorIds.map((floorId) => listPortalApartments(floorId)),
        );
        if (cancelled) {
          return;
        }
        setApartments(
          lists.flat().map((apartment) => ({
            id: apartment.id,
            label: apartment.number,
          })),
        );
      } catch {
        if (!cancelled) {
          setApartments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingApartments(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, projectQuery.data]);

  const onLink = async () => {
    setError(null);
    setMessage(null);
    if (!apartmentId) {
      setError(t("selectApartment"));
      return;
    }
    try {
      await attachMutation.mutateAsync({ apartmentId });
      setMessage(t("linkSuccess"));
      setApartmentId("");
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onUnlink = async (linkedApartmentId: string, label: string) => {
    setError(null);
    setMessage(null);
    if (!window.confirm(t("unlinkConfirm", { apartment: label }))) {
      return;
    }
    try {
      await detachMutation.mutateAsync(linkedApartmentId);
      setMessage(t("unlinkSuccess"));
    } catch {
      setError(t("errors.unlinkBlocked"));
    }
  };

  const busy = attachMutation.isPending || detachMutation.isPending;

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t("apartmentsTitle")}</h2>

      {deal.apartments.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("apartmentsEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deal.apartments.map((link) => {
            const label = link.apartmentNumber ?? link.apartmentId;
            return (
              <li
                key={link.id}
                className="flex items-center justify-between gap-3 rounded-sm bg-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">
                  {label}
                  <span className="ml-2 text-xs font-normal text-ink-muted">
                    {t(`linkTypes.${link.linkType}`)}
                    {link.isPrimary ? ` · ${t("primary")}` : null}
                  </span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    void onUnlink(link.apartmentId, label);
                  }}
                >
                  {t("unlinkApartment")}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <FormField id="link-project" label={t("linkProject")}>
        <select
          id="link-project"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setApartmentId("");
          }}
        >
          <option value="">{t("selectProject")}</option>
          {(projectsQuery.data?.data ?? []).map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="link-apartment" label={t("linkApartment")}>
        <select
          id="link-apartment"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
          value={apartmentId}
          disabled={!projectId || loadingApartments}
          onChange={(event) => {
            setApartmentId(event.target.value);
          }}
        >
          <option value="">
            {loadingApartments ? t("loadingApartments") : t("selectApartment")}
          </option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              {apartment.label}
            </option>
          ))}
        </select>
      </FormField>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-ink">
          {message}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        disabled={busy || !apartmentId}
        onClick={() => {
          void onLink();
        }}
      >
        {attachMutation.isPending ? t("saving") : t("linkApartmentAction")}
      </Button>
    </section>
  );
};
