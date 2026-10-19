export type PrivacyRichItem = {
  readonly title: string;
  readonly body: string;
};

export type PrivacySection = {
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly PrivacyRichItem[];
  readonly points?: readonly PrivacyRichItem[];
  readonly note?: string;
  readonly trailing?: readonly string[];
};

export type PrivacyPolicyCopy = {
  readonly title: string;
  readonly intro: readonly string[];
  readonly sections: readonly PrivacySection[];
};
