# Clients Activities Notes

## Client Concept

CRM needs a buyer/client record for follow-up.

In most ToonExpo flows, client is linked to a registered BuyerProfile.

Examples:

- buyer sent request from apartment page;
- builder scanned buyer QR;
- buyer registered before event.

## CRM-Only Client

Manual builder entry may create a CRM-only client if no BuyerProfile exists.

v1 can support this only if needed.

If CRM-only client is implemented:

- it belongs to builder company;
- it does not automatically create buyer account unless user flow explicitly does that;
- it can be linked to BuyerProfile later.

## Activities

CRM activities are lightweight follow-up records inside a deal.

Examples:

- call;
- email;
- meeting;
- send offer;
- follow-up reminder;
- status update.

## Activity Status

Recommended simple activity statuses:

```text
planned
done
cancelled
```

Do not confuse this with the global task/process module.

## Activity Fields

- id;
- crm_deal_id;
- type;
- title;
- due_at optional;
- status;
- assigned_user_id optional;
- completed_at optional;
- created_by_user_id;
- created_at;
- updated_at.

## Notes

CRM notes/comments are internal builder records.

Fields:

- id;
- crm_deal_id;
- author_user_id;
- body;
- visibility;
- created_at;
- updated_at.

v1 visibility:

```text
internal
```

Buyer-facing messages can be added later if messaging is implemented.

## Communication Log

v1 can manually log communications.

Automatic email/phone integration is not required.

## Follow-up Reminder

If activity has due date, CRM dashboard can show:

- upcoming follow-ups;
- overdue follow-ups;
- follow-up needed status.

This remains CRM-local.

