import { sponsorContact, sponsorTiers } from "./sponsors";

const repository = "https://github.com/Atharvsinh-codez/ObsidianUI";

export const termsUpdated = { iso: "2026-10-18", label: "October 18, 2026" } as const;

/** Inline text supports **bold** and [label](href); the page and the Markdown export share it. */
export type TermsBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: readonly string[] }
  | { type: "callout"; tone: "warning" | "info"; title: string; text: string; contact?: boolean };

export type TermsSection = { id: string; title: string; blocks: readonly TermsBlock[] };

const email = `[${sponsorContact.email}](mailto:${sponsorContact.email})`;
const x = `[@athrix_codes on X](${sponsorContact.x})`;
const telegram = `[@athrix on Telegram](${sponsorContact.telegram})`;

const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);
const tierList = sponsorTiers.map(tier =>
  `**${tier.name}: $${tier.price} per month.** ${tier.perks.map((perk, index) => (index ? lowerFirst(perk) : perk)).join(", ")}.`);
const priceSummary = sponsorTiers.map(tier => `${tier.name} is $${tier.price}/month`).join(" and ");

export const termsSummary = [
  { icon: "code", title: "Free and open source", text: "Components are MIT licensed. Use them in personal and commercial projects." },
  { icon: "user", title: "No account needed", text: "Browse, copy, and install components without signing up." },
  { icon: "calendar", title: "Monthly sponsorships", text: `${priceSummary}, billed through Dodo Payments until you cancel.` },
  { icon: "message", title: "Cancel any time", text: "From the billing portal link in your Dodo Payments receipt, or by DM or email." },
  { icon: "clock", title: "Live until the month ends", text: "After you cancel, your logo stays up until the period you paid for ends." },
] as const;

export const termsSections: readonly TermsSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    blocks: [
      { type: "paragraph", text: "These Terms of Service (the **Terms**) govern your use of obsidianui.dev, including its pages, documentation, component registry, prompts, templates, Markdown files, and API endpoints (together, the **Website**), and any sponsorship you buy from ObsidianUI." },
      { type: "paragraph", text: "By using the Website or paying for a sponsorship, you agree to these Terms. If you use the Website or buy a sponsorship on behalf of a company or other organisation, you confirm that you can accept these Terms for it, and “you” includes that organisation." },
      { type: "paragraph", text: "If you don’t agree with these Terms, please don’t use the Website or buy a sponsorship." },
    ],
  },
  {
    id: "about",
    title: "Who we are",
    blocks: [
      { type: "paragraph", text: "ObsidianUI is an open-source React and Tailwind CSS component library, built and maintained by Atharv. In these Terms, “ObsidianUI”, “we”, “us”, and “our” mean ObsidianUI and Atharv as its maintainer." },
      { type: "paragraph", text: `You can reach us by email at ${email}, by DM to ${x}, or at ${telegram}. All contact details are in [Contact](#contact).` },
    ],
  },
  {
    id: "definitions",
    title: "Key terms",
    blocks: [
      { type: "paragraph", text: "A few words have a specific meaning in these Terms:" },
      {
        type: "list",
        items: [
          "**Website**: obsidianui.dev and its subdomains, pages, documentation, registry files, Markdown files, and public API endpoints.",
          "**Components**: the React components, blocks, hooks, styles, and other source code published in the ObsidianUI registry and GitHub repository.",
          "**Content**: documentation, prompts, templates, text, graphics, video, and other material on the Website.",
          "**Sponsor**: a person or organisation that pays for an ObsidianUI sponsorship.",
          "**Sponsor Materials**: the logo, name, links, handles, and other material a Sponsor gives us for their placement.",
          "**Billing period**: the one-month period covered by each sponsorship payment.",
        ],
      },
    ],
  },
  {
    id: "using",
    title: "Using the website",
    blocks: [
      { type: "paragraph", text: "The Website is free to use. You don’t need an account to browse components, read documentation, copy prompts, or download registry files." },
      { type: "paragraph", text: "When you use the Website, you agree not to:" },
      {
        type: "list",
        items: [
          "break the law, or help anyone else break it;",
          "try to gain unauthorised access to the Website, its servers, or any connected system;",
          "disrupt the Website, including by sending traffic at a volume or rate that slows it down for others;",
          "upload or send malware, or use the Website to distribute it;",
          "misrepresent who you are or your relationship with ObsidianUI, including claiming that ObsidianUI endorses you when it doesn’t;",
          "remove copyright or license notices that the license requires you to keep.",
        ],
      },
      { type: "paragraph", text: "We may block or limit access for anyone who breaks these rules or puts the Website at risk." },
    ],
  },
  {
    id: "open-source",
    title: "Open-source components and the MIT License",
    blocks: [
      { type: "paragraph", text: `ObsidianUI’s source code is published under the [MIT License](${repository}/blob/main/LICENSE). That license, not these Terms, sets out what you can do with the code. In short, you can use, copy, modify, merge, publish, distribute, sublicense, and sell copies of it, in personal and commercial projects, as long as you keep the copyright and license notice where the license requires it.` },
      { type: "paragraph", text: "Where these Terms and the MIT License differ about the code itself, the MIT License applies." },
      { type: "heading", text: "Third-party code and assets" },
      { type: "paragraph", text: "Components can depend on third-party packages such as React, Tailwind CSS, Motion, GSAP, and Three.js. Each package has its own license, and you are responsible for following it." },
      { type: "paragraph", text: "Some previews use demo images, videos, fonts, or other media. Unless a file says otherwise, demo media is there to show how a component behaves and is not licensed to you for reuse. Replace it with your own assets before you ship." },
      { type: "heading", text: "Your projects stay yours" },
      { type: "paragraph", text: "What you build with ObsidianUI belongs to you. We claim no ownership of your projects, and you don’t need to credit ObsidianUI beyond what the MIT License requires, though a link back is always appreciated." },
    ],
  },
  {
    id: "content",
    title: "Documentation, prompts, and templates",
    blocks: [
      { type: "paragraph", text: "Documentation, prompts, and templates are there to help you build. Prompts are written for AI coding agents, and results depend on the agent and model you use. Review and test any code an agent produces before you rely on it." },
      { type: "paragraph", text: "Templates such as Project One live in their own repositories and are covered by the license in each repository." },
    ],
  },
  {
    id: "agents-api",
    title: "Registry, API, and AI agent access",
    blocks: [
      { type: "paragraph", text: "The component registry, Markdown files, llms.txt, and the public read-only API are open to people and AI agents without an API key. You may use them to discover, read, and install components." },
      { type: "paragraph", text: "These endpoints come with no uptime guarantee or service level. We may change, rate-limit, or retire an endpoint, and we may block clients that send abusive traffic." },
    ],
  },
  {
    id: "sponsorships",
    title: "Sponsorships",
    blocks: [
      { type: "paragraph", text: "Sponsors fund ObsidianUI’s development and keep it free and open source for everyone. This section applies to every sponsorship you buy." },
      { type: "heading", text: "Tiers and pricing" },
      { type: "paragraph", text: "These are the current monthly tiers:" },
      { type: "list", items: tierList },
      { type: "paragraph", text: "Prices are in US dollars. Custom packages are agreed in writing, by email or DM, and these Terms cover them too unless that written agreement says otherwise." },
      { type: "heading", text: "What a sponsorship is, and what it isn’t" },
      { type: "paragraph", text: "A sponsorship buys the placements and perks listed for your tier for each billing period you pay for. It does not:" },
      {
        type: "list",
        items: [
          "give you ownership of, or control over, ObsidianUI, its roadmap, or its code;",
          "guarantee any number of visits, clicks, impressions, sign-ups, or sales;",
          "mean that ObsidianUI endorses your products or services;",
          "create a partnership, joint venture, agency, or employment relationship.",
        ],
      },
      { type: "paragraph", text: "We decide the exact layout, size, and position of placements within what your tier describes, and we may redesign the Website, the sponsors page, or the README over time. If a redesign moves placements, your tier keeps its relative prominence." },
      { type: "heading", text: "Payments through Dodo Payments" },
      { type: "paragraph", text: "Checkout is handled by [Dodo Payments](https://dodopayments.com), which acts as the merchant of record. Dodo Payments processes your payment, charges any applicable taxes, and emails your receipt. We never see or store your full card details. Your payment is also subject to Dodo Payments’ own terms and privacy policy." },
      { type: "heading", text: "Monthly billing and renewal" },
      { type: "paragraph", text: "Sponsorships are subscriptions. Your first payment covers your first month, and the subscription renews automatically every month at your tier’s current price until you cancel. Each renewal is charged to the payment method on file." },
      { type: "paragraph", text: "If a renewal payment fails, we may pause or remove your placement until the payment goes through." },
      { type: "heading", text: "Your sponsor materials" },
      { type: "paragraph", text: "After checkout, your welcome page lists what we need: your logo (light and dark versions if you have them), the link your logo should open, your name as it should appear, and your X and LinkedIn handles. Send them by email, X, or Telegram. Placements are added by hand, so they go live after we receive your materials, not at the moment you pay." },
      { type: "paragraph", text: "You give us a non-exclusive, worldwide, royalty-free license to use, reproduce, resize, adapt for light and dark themes, and display your Sponsor Materials on the Website, in the README, and in posts about your sponsorship, while your sponsorship is active and for a reasonable time afterwards while we remove them. Posts already published on social platforms, such as your shoutout on X, may stay up." },
      { type: "paragraph", text: "You confirm that you own or have permission to use everything in your Sponsor Materials, that they don’t infringe anyone’s rights, and that your link doesn’t lead to unlawful or harmful content." },
      { type: "heading", text: "Sponsors we can’t accept" },
      { type: "paragraph", text: "We want sponsors that fit an open-source developer community. We may decline a sponsorship, or remove a placement, for a business or link that involves illegal activity, malware or phishing, scams or misleading claims, adult content, gambling, hate or harassment, or anything else that could harm ObsidianUI’s users or reputation." },
      { type: "paragraph", text: "If we decline your sponsorship before your placement goes live, we will cancel your subscription and refund that payment. If we remove a live placement because your business, link, or Sponsor Materials break these Terms, we will cancel your subscription and no refund is due." },
      { type: "heading", text: "Changes to tiers and prices" },
      { type: "paragraph", text: "We may change tiers, perks, or prices. Changes apply to existing sponsors from their next billing period, and we will tell you by email or DM before a price increase takes effect, so you can cancel first if you prefer." },
    ],
  },
  {
    id: "refunds",
    title: "No refunds",
    blocks: [
      { type: "callout", tone: "warning", title: "All sponsorship payments are final", text: "Sponsorship payments are non-refundable. We don’t give refunds or credits for partial months, unused time, or cancelling partway through a billing period." },
      { type: "paragraph", text: "Sponsorships fund ongoing work on ObsidianUI, and your placement is reserved from the moment you pay. That is why every payment, the first one and every renewal, is final once it has been charged." },
      { type: "paragraph", text: "The only exceptions are:" },
      {
        type: "list",
        items: [
          "**Duplicate or mistaken charges.** If you were charged twice for the same period, or charged for a renewal after you asked us to cancel before the renewal date, tell us and we will refund the extra payment.",
          "**Sponsorships we decline.** If we decline your sponsorship before your placement goes live, as described in [Sponsorships](#sponsorships).",
          "**Rights under law.** Nothing in these Terms removes a refund right that the law where you live gives you and doesn’t allow a business to exclude.",
        ],
      },
      { type: "paragraph", text: "If you think a charge is wrong, please contact us before disputing it with your bank or card issuer. Most billing problems are sorted out quickly over email. If you open a chargeback for a payment these Terms don’t make refundable, we may remove your placement and end your sponsorship." },
    ],
  },
  {
    id: "cancellation",
    title: "Cancelling a sponsorship",
    blocks: [
      { type: "callout", tone: "info", title: "Two ways to cancel", text: `Use the billing portal link in your Dodo Payments receipt, or message Atharv: DM ${x} or ${telegram}, or email ${email}.`, contact: true },
      { type: "paragraph", text: "You can cancel at any time, for any reason. There is no cancellation fee and no minimum term." },
      { type: "heading", text: "From the billing portal" },
      { type: "paragraph", text: "Your Dodo Payments receipt includes a link to the billing portal, where you can cancel your subscription or update your card yourself. Once you cancel there, you won’t be charged again." },
      { type: "heading", text: "By message" },
      { type: "paragraph", text: "If you’d rather we handle it, message us. So we can find the right subscription, please include:" },
      {
        type: "list",
        items: [
          "your company or product name;",
          "the email address you used at Dodo Payments checkout;",
          `your sponsorship tier (${sponsorTiers.map(tier => tier.name).join(" or ")}).`,
        ],
      },
      { type: "paragraph", text: "We will cancel the renewal in Dodo Payments and reply to confirm. If you message us before your renewal date and the cancellation doesn’t go through in time, we will refund that renewal." },
      { type: "heading", text: "What happens after you cancel" },
      {
        type: "list",
        items: [
          "You won’t be charged again.",
          "Your placement and perks stay live until the end of the billing period you already paid for.",
          "When that period ends, we remove your logo from the Website and the README.",
          "The remaining days of the current period are not refunded, as explained in [No refunds](#refunds).",
        ],
      },
      { type: "paragraph", text: "You’re welcome back any time. To sponsor again, check out from the [sponsors page](/sponsors#tiers)." },
      { type: "heading", text: "When we cancel" },
      { type: "paragraph", text: "We may cancel a sponsorship if renewal payments keep failing, if the sponsorship breaks these Terms, or if we stop offering sponsorships. If we stop offering sponsorships, or end yours for a reason that isn’t your fault, we will either keep your placement up until the end of the period you paid for or refund the unused part of that period." },
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    blocks: [
      { type: "paragraph", text: "Apart from the open-source code covered by the MIT License, the Website’s design, the ObsidianUI name and logo, and our original Content belong to ObsidianUI. You may mention ObsidianUI by name to say that your project uses it, but you may not use the ObsidianUI name or logo in a way that suggests we endorse or are affiliated with you without our written permission." },
      { type: "paragraph", text: "Names and logos of sponsors and partners, such as Vercel and Tracwell, belong to their owners and appear with their permission." },
    ],
  },
  {
    id: "contributions",
    title: "Contributions and feedback",
    blocks: [
      { type: "paragraph", text: `Issues, pull requests, and discussions on GitHub are covered by the repository’s license and [contributing guide](${repository}/blob/main/CONTRIBUTING.md). By submitting a pull request, you agree that your contribution is licensed under the MIT License.` },
      { type: "paragraph", text: "If you send us ideas, feedback, or feature requests, we may use them without owing you anything. A Diamond sponsor’s direct line for feedback is a way to be heard quickly, not a promise to build a specific feature." },
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    blocks: [
      { type: "paragraph", text: "The Website relies on third-party services, including Vercel for hosting, Cloudflare for media delivery, Tracwell for analytics, Dodo Payments for checkout, and GitHub, X, and Telegram for code and communication. Each is governed by its own terms and policies, and we aren’t responsible for their availability or actions." },
      { type: "paragraph", text: "Links to other websites, including sponsor links, are there for convenience. We don’t control those sites and aren’t responsible for their content or practices." },
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    blocks: [
      { type: "paragraph", text: "We collect as little as we can:" },
      {
        type: "list",
        items: [
          "**Analytics.** Tracwell tells us which pages people use and which code they copy, in aggregate.",
          "**Sponsors.** Dodo Payments shares the details we need to manage your subscription, such as your name and email address. We also keep the Sponsor Materials you send us.",
          "**Messages.** If you email or DM us, we keep the conversation so we can reply and manage your sponsorship.",
        ],
      },
      { type: "paragraph", text: "We don’t sell personal information. To ask about, correct, or delete information we hold about you, use the contact details below." },
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    blocks: [
      { type: "paragraph", text: "The Website, Components, Content, and API are provided “as is” and “as available”, without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement, to the fullest extent the law allows." },
      { type: "paragraph", text: "We don’t promise that the Website will be uninterrupted, error-free, or secure, or that any Component will work in your project, browser, or framework version. Test code before you ship it." },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      { type: "paragraph", text: "To the fullest extent the law allows, ObsidianUI and Atharv are not liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, data, or goodwill, arising from your use of the Website, Components, Content, or a sponsorship." },
      { type: "paragraph", text: "Our total liability for any claim relating to these Terms or the Website is limited to the greater of the amount you paid us for sponsorships in the three months before the claim arose, or US$100." },
      { type: "paragraph", text: "Some places don’t allow certain limitations, so some of these may not apply to you." },
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    blocks: [
      { type: "paragraph", text: "If you are a Sponsor, you agree to defend and compensate ObsidianUI and Atharv for claims, losses, and costs, including reasonable legal fees, that arise from your Sponsor Materials, the content your link leads to, or your breach of these Terms." },
    ],
  },
  {
    id: "termination",
    title: "Suspension and termination",
    blocks: [
      { type: "paragraph", text: "You can stop using the Website at any time. We may suspend or end your access to the Website, or end a sponsorship as described in [Cancelling a sponsorship](#cancellation), if you break these Terms or if we need to protect the Website, its users, or ObsidianUI." },
      { type: "paragraph", text: "Sections that by their nature should continue, including No refunds, Intellectual property, Disclaimers, Limitation of liability, and Indemnity, survive the end of your use or sponsorship." },
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    blocks: [
      { type: "paragraph", text: "We may update these Terms as ObsidianUI and its sponsorships change. The date at the top of this page shows when they last changed. For significant changes that affect active sponsors, we will tell you by email or DM before they take effect. If you keep using the Website or keep a sponsorship active after a change, you accept the updated Terms." },
    ],
  },
  {
    id: "law",
    title: "Governing law and disputes",
    blocks: [
      { type: "paragraph", text: "These Terms are governed by the laws of India, without regard to conflict-of-law rules. If a dispute comes up, please contact us first and we will try to resolve it informally. If we can’t resolve it within 30 days, either of us may take it to the competent courts of India, unless the law where you live gives you the right to bring it elsewhere." },
    ],
  },
  {
    id: "general",
    title: "General",
    blocks: [
      {
        type: "list",
        items: [
          "**Entire agreement.** These Terms, together with the MIT License for the code and any written custom sponsorship agreement, are the whole agreement between you and us about the Website and sponsorships.",
          "**Severability.** If any part of these Terms is found unenforceable, the rest stays in effect.",
          "**No waiver.** If we don’t enforce part of these Terms straight away, we can still enforce it later.",
          "**Assignment.** You may not transfer your sponsorship or these Terms without our consent. We may transfer them if ObsidianUI changes hands.",
          "**Language.** These Terms are written in English, and the English version applies.",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      { type: "paragraph", text: "Questions about these Terms, a payment, or your sponsorship? Get in touch:" },
      {
        type: "list",
        items: [
          `**Email:** ${email}`,
          `**X:** [@athrix_codes](${sponsorContact.x})`,
          `**Telegram:** [@athrix](${sponsorContact.telegram})`,
        ],
      },
    ],
  },
];

function absoluteLinks(text: string, origin: string) {
  return text.replace(/\]\(#/g, `](${origin}/terms#`).replace(/\]\(\//g, `](${origin}/`);
}

export function termsMarkdown(origin: string) {
  const summary = termsSummary.map(item => `- **${item.title}.** ${item.text}`).join("\n");
  const sections = termsSections.map((section, index) => {
    const body = section.blocks.map(block => {
      switch (block.type) {
        case "heading": return `### ${block.text}`;
        case "paragraph": return block.text;
        case "list": return block.items.map(item => `- ${item}`).join("\n");
        case "callout": return `> **${block.title}.** ${block.text}`;
      }
    }).join("\n\n");
    return `## ${index + 1}. ${section.title}\n\n${body}`;
  }).join("\n\n");
  return absoluteLinks(
    `# ObsidianUI Terms of Service\n\nLast updated: ${termsUpdated.label}\n\nThese Terms cover your use of obsidianui.dev and any ObsidianUI sponsorship you buy.\n\n## The short version\n\nThis summary is for convenience. The full Terms below are what apply.\n\n${summary}\n\n${sections}\n`,
    origin,
  );
}
