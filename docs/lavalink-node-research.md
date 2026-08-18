# Lavalink node provider research

Checked: **2026-08-18** (Asia/Bangkok)

## Short answer

For this repository, the strongest choices I found are:

1. **Self-host official Lavalink v4 on a mainstream Singapore VPS** (for example, DigitalOcean) when control, predictable ownership, and private credentials matter most.
2. **HeavenCloud managed Lavalink** as a conditional APAC candidate, but only after support confirms the purchased node runs Lavalink **4.2.0 or newer with DAVE**. Its public page says only “v4,” which is not specific enough in 2026.
3. **Lavahost** for an easy protocol/integration trial: its documentation publishes an exact Shoukaku v4 configuration, but neither its Lavalink point version/DAVE support nor normal production trust paperwork is publicly verifiable.
4. **Do not use the repository's current Jirayu public node for voice playback.** A current public listing reports it as Lavalink 4.0.8, which predates DAVE and is no longer compatible with normal Discord voice channels.

For production, do **not** build around an anonymous public-node password copied from a GitHub list or aggregator. Public shared nodes have no isolation, usually no SLA, can be saturated or withdrawn without notice, and expose queries and operational metadata to an operator with whom you have no account agreement.

## Important legal limitation

Lavalink itself is a legitimate open-source project released under the MIT license, and v4 is the current stable protocol ([official Lavalink repository](https://github.com/lavalink-devs/Lavalink), [official v4 changelog](https://lavalink.dev/changelog/v4)). That does **not** license the media played through it.

This repository sets Kazagumo's default search engine to `youtube`. YouTube's official developer policies prohibit separating or isolating audio from YouTube audiovisual content and prohibit background playback. They also prohibit using technology other than the YouTube API Services to retrieve YouTube audiovisual content ([YouTube API Services policies](https://developers.google.com/youtube/terms/developer-policies), [policy compliance guide](https://developers.google.com/youtube/terms/developer-policies-guide)). Consequently, I cannot call a Lavalink node that extracts YouTube audio "fully legal" or YouTube-ToS-compliant merely because the host is a legitimate business. Discord also requires applications to comply with applicable third-party agreements ([Discord Developer Terms](https://support-dev.discord.com/hc/en-us/articles/8562894815383-Discord-Developer-Terms-of-Service)).

For the lowest legal and platform-policy risk, use only audio you own, public-domain or properly licensed files/streams, or sources whose terms explicitly authorize this use. A provider's “YouTube/Spotify support” is a technical claim, not a content licence. This is a practical risk assessment, not legal advice.

## Compatibility with this repository

The project uses:

- `kazagumo` `^3.4.3`
- `shoukaku` `^4.3.0`
- Shoukaku `NodeOption` objects loaded from `lavalinkNodes.json`
- the fields `name`, `url`, `auth`, and `secure`

Official Lavalink documentation lists Shoukaku as a current Node.js client, and the current client table includes DAVE support ([Lavalink client list](https://lavalink.dev/clients)). Shoukaku's official repository describes it as a current Lavalink wrapper and lists Kazagumo as its queue wrapper ([Shoukaku repository](https://github.com/shipgirlproject/Shoukaku)). A Lavalink **4.2.0 or newer** endpoint is the required target, not merely any “v4” endpoint. Lavalink 4.2.0 was the first release with DAVE support, and Discord has required DAVE/E2EE-capable clients for ordinary voice calls since March 2026 ([official Lavalink v4 changelog](https://lavalink.dev/changelog/v4), [Discord's DAVE rollout](https://discord.com/blog/bringing-dave-to-all-discord-platforms)). The current stable Lavalink release is 4.2.2. Provider pages that advertise only “v4” remain compatibility candidates until their actual `/version` output and a real voice-playback test confirm 4.2.x.

One repository-specific security issue matters before using any private paid node: `lavalinkNodes.json` is committed and currently contains `auth` inline. That is acceptable only for a deliberately public password. A paid provider API key should come from an environment variable or secret store, which requires a small configuration change before adding it.

## Recommended hosted options

### 1. HeavenCloud managed Lavalink — conditional APAC candidate

**Why it made the shortlist:** Of the niche managed hosts reviewed, HeavenCloud publishes the most complete first-party paper trail: current terms, privacy policy, SLA, status page, regional information, contact information, and a Lavalink v4 claim. Its exact deployed version and DAVE support still need confirmation.

- **Compatibility:** The managed product advertises Lavalink v4 and LavaSrc. Purchased connection details should map directly to Shoukaku's `url`, `auth`, and `secure` fields ([managed v4 page](https://heavencloud.in/service/lavalink-hosting/v4)).
- **Pricing/free limits:** The site advertises Lavalink “from ₹49/month” and a 24-hour managed trial. Its detailed regional pages show higher concrete managed plans—for example, USA plans from ₹350/month and India plans from ₹525/month—so confirm the actual region and resource tier at checkout rather than relying on the headline price ([USA plans](https://heavencloud.in/service/lavalink-hosting/usa), [India plans](https://heavencloud.in/service/lavalink-hosting/india)).
- **Regions:** India (Mumbai/Delhi), Singapore/Johor, Australia (Sydney), several US cities, and Germany are advertised. The formal SLA names Germany, India, Singapore, Ashburn, Miami, and Utah ([SLA](https://heavencloud.in/service-level-agreement)). For a Thailand-based bot/user base, Singapore is the sensible first latency test.
- **Service level:** Paid managed Lavalink has a published 99.95% monthly network uptime SLA with service-credit terms. Free public nodes have no paid SLA. At check time, the provider status page showed all services online; its 30-day regional figures ranged from 98.209% for Mumbai to 100% for several regions ([status page](https://status.heavencloud.in/)).
- **Legal/trust signals:** Published [terms](https://heavencloud.in/terms-of-services), [privacy policy](https://heavencloud.in/privacy-policy), SLA, refund/fair-use links, support email, billing portal, and live infrastructure status.
- **Risks:** It remains a small independent host, its headline and detailed pricing are inconsistent, and several infrastructure/uptime claims are self-reported. The terms identify “HeavenCloud” but do not show a company registration number or full legal entity/address on the page reviewed. Buy monthly first and test the actual Singapore path.
- **Connection:** Private host, port, password/API key, and TLS choice are issued after order; do not invent them from a public list.

**Verdict:** Conditional paid trial for this project, especially in Southeast Asia. Before paying, require written confirmation of Lavalink 4.2.0+ and DAVE; then verify `/version`, use a private TLS endpoint and unique key, and test real voice playback before committing.

### 2. Lavahost — easiest exact Shoukaku integration, good prototype tier

**Why it made the shortlist:** Lavahost publishes unusually clear v4 protocol documentation, including the exact Shoukaku shape used by this repository.

- **Compatibility:** The provider documents the Lavalink v4 protocol and this Shoukaku configuration: host `gateway.lavahost.net`, port `443`, per-account authorization key, and `secure: true` ([Lavahost documentation](https://lavahost.net/docs)). This proves that the repository can connect at the protocol level, but the public docs do not publish a 4.2.x server version or mention DAVE, so successful 2026 Discord voice playback is not confirmed.
- **Pricing/free limits:** Free: 1 simultaneous player and 100 track plays/day. Starter: $4.99/month for 5 simultaneous players. Growth: $25/month for 50 included players, then published overage. Scale: $75/month for 200 included players ([pricing](https://lavahost.net/#pricing)).
- **Regions:** No selectable regions are published on the pages reviewed; the service exposes one global gateway.
- **Public connection format:**

  ```ts
  {
    name: "lavahost",
    url: "gateway.lavahost.net:443",
    auth: process.env.LAVAHOST_KEY,
    secure: true,
  }
  ```

  The API key is private and created in the dashboard. Do not copy the placeholder or commit the real key.

- **Legal/trust signals:** HTTPS, revocable per-account API keys, documented v4 WebSocket/REST endpoints, published limits, support email, and a no-card free tier.
- **Risks:** The site labels itself beta. I did not find public terms of service, privacy policy, a legal entity/address, an SLA, or a status page on the public site. Claims such as high availability and direct Discord voice peering are provider claims without a public SLA. Treat the free tier as a technical evaluation, not evidence of production reliability.

**Verdict:** Useful zero-cost integration test, but not yet a confirmed voice-compatible or production-trustworthy recommendation. Upgrade only if `/version` reports 4.2.0+, real playback works, and the operator supplies acceptable terms/privacy details.

### 3. Yukimi Network / ORESHI / Jirayu — paid service candidate; public node incompatible

**Why it made the shortlist:** This is not a random credential from an aggregator: the repository's current endpoint is on `jirayu.net`, and the operator now presents a managed Lavalink business under Yukimi Network/ORESHI with pricing, policies, TLS, monitoring, and multiple regions ([current provider site](https://yukimi.pw/), [terms](https://provider.jirayu.net/terms)).

- **Compatibility:** The existing repository node is publicly identified as “Jirayu v4,” but a listing checked on 2026-08-18 reports version 4.0.8 ([public node listing](https://lavalink.darrennathanael.com/SSL/Lavalink-SSL/)). Lavalink 4.0.8 predates DAVE, so this endpoint is not compatible with ordinary Discord voice playback after March 2026. A paid endpoint could be compatible only if the provider separately confirms and exposes Lavalink 4.2.0+.
- **Pricing/free limits:** The current site shows Starter $5/month, Pro $10, Power $15, and Max $30, with a 3-day Pro trial. However, the provider's terms say paid plans start at $10/month. Confirm the dashboard price and plan resource allocation before purchase.
- **Regions:** The current marketing lists global regions; a recent first-party provider page enumerates Chicago, Miami, Ohio, Frankfurt, Helsinki, and Singapore. The terms describe USA, Finland, and Singapore.
- **Legal/trust signals:** Published terms, privacy/cookie links, support email, paid dashboard, TLS by default for paid nodes, 24/7 monitoring claims, and an acceptable-use section that prohibits infringement and says users must have rights to audio they retrieve and transmit.
- **Risks:** Multiple active names/domains and redirects (`jirayu.net`, ORESHI, Yukimi Network), conflicting starting-price information, and no independently validated uptime evidence in this review. Its terms also say service can be interrupted and disclaim uninterrupted service despite a marketing “99.9% uptime SLA.”
- **Connection:** Use the host, port, and unique credentials issued by its dashboard for paid service. Prefer the Singapore TLS endpoint if available.

**Verdict:** Do not use the current public Jirayu endpoint for voice playback. For a paid node, first require Lavalink 4.2.0+/DAVE confirmation and ask support to reconcile the brand, price, SLA, and legal entity on the invoice.

## Strongest operational-trust option: self-host official v4

This is not a managed Lavalink-node vendor, but it is the cleanest answer if “trustworthy” means knowing exactly who can inspect requests and when software changes.

DigitalOcean is one practical APAC example: it publishes Singapore availability and Basic Droplets at $6/month for 1 GiB RAM or $12/month for 2 GiB RAM ([Droplet regions/product](https://www.digitalocean.com/products/droplets), [current pricing](https://www.digitalocean.com/pricing/droplets)). The official Lavalink project supports Linux x86-64, requires Java 17 or newer, publishes Docker/systemd setup, and exposes the same v4 API used by hosted nodes ([official repository](https://github.com/lavalink-devs/Lavalink), [configuration docs](https://lavalink.dev/configuration/)).

Use at least the 1 GiB tier for a small test and prefer 2 GiB for production headroom. Put Lavalink behind a TLS reverse proxy, use a long unique password stored outside Git, restrict the firewall, enable monitoring, and keep Lavalink/plugins patched. Self-hosting improves operational control; it does not remove the media-source policy risks described above.

## Public shared nodes: testing only

HeavenCloud's first-party public-node page explicitly says free nodes are for testing and production should use managed hosting. It currently publishes these entries ([official public-node page](https://heavencloud.in/service/public-lavalink-servers)), but it does not publish their exact point versions. They must not be treated as DAVE-compatible merely because the page labels some of them “v4”:

```json
[
  {
    "name": "heavencloud-public",
    "url": "89.106.84.59:4000",
    "auth": "heavencloud.in",
    "secure": false
  },
  {
    "name": "jirayu-public",
    "url": "lavalink.jirayu.net:13592",
    "auth": "youshallnotpass",
    "secure": false
  }
]
```

These passwords are included only because the operators intentionally publish them. The second entry is already the node in this repository and is separately reported as version 4.0.8, so it is incompatible with current ordinary Discord voice playback. Both are unencrypted, shared, and carry no paid SLA; searches and metadata travel without TLS. Do not send bot tokens to a Lavalink node—only the Lavalink password belongs in `auth`—and do not use either for sensitive or production workloads.

I excluded other credentials copied between public-node lists because an aggregator being able to connect is not evidence that the owner authorizes third-party use. I also excluded a public node whose own page reported it offline during the review.

## Recommended decision

- **Small/private bot, fastest validation:** Create a Lavahost free key and test `/version` plus one real voice player, after moving `auth` out of committed JSON. Reject it if it is older than 4.2.0 or playback fails.
- **Low-maintenance production in Thailand/APAC:** HeavenCloud's paid Singapore managed node is a candidate, not a confirmed match. Trial it only after written 4.2.0+/DAVE confirmation; verify the actual version, invoice, exact SLA tier, TLS endpoint, and source plugins.
- **Most defensible operational choice:** Run official Lavalink v4 on a 2 GiB Singapore VPS from a mainstream cloud provider, with TLS and private authentication.
- **Current Jirayu node:** Remove it from active fallback rotation. The listed version is pre-DAVE, and the endpoint is also shared, non-TLS, and without a production SLA.
- **If “legal” is strict:** Disable YouTube as the default search/playback source and restrict the bot to audio for which you have playback/redistribution permission. Changing node providers does not solve that issue.

## Pre-purchase/test checklist

1. Confirm `/version` returns Lavalink **4.2.0 or newer** and that a real non-stage Discord voice channel plays audio; a generic “v4” claim is insufficient.
2. Require TLS (`secure: true`) for any private/paid node.
3. Keep `auth` in an environment variable or secret manager; rotate it after any accidental commit.
4. Ask whether DAVE is supported on the deployed Lavalink/client combination; current official Lavalink and Shoukaku listings support it, but the provider must keep its server current.
5. Test from the bot's actual host to the provider region—not from a laptop—including voice join, search, play, seek, reconnect/resume, and a 30–60 minute stream.
6. Record player/concurrency caps, daily request limits, bandwidth/fair-use rules, SLA exclusions, cancellation/refund rules, and log retention.
7. Do not treat advertised support for a media platform as permission to extract or rebroadcast its content.

## Free-fallback verification addendum

Checked: **2026-08-18** (Asia/Bangkok). This pass required a free fallback and therefore tested operator-published endpoints directly instead of accepting copied node lists.

### Result

I did **not** find a third-party shared node that currently satisfies all of these requirements at once: operator-authorized use, live service, TLS, a server-reported Lavalink version of **4.2.0 or newer**, and enough operator/status evidence to call it trustworthy. The dependable free recommendation is therefore a **second, self-hosted official Lavalink 4.2.2 instance on an OCI Always Free VM**, deployed separately from the primary node. This is still a real fallback node; it simply has private credentials controlled by this project rather than a public password shared with hundreds of bots.

Oracle's current Free Tier documentation says an Always Free tenancy may use up to **2 Ampere A1 OCPUs and 12 GB RAM** in its home region, subject to capacity, and warns that idle compute can be reclaimed. Always Free has no paid SLA or support entitlement. Choose Singapore as the home region if it is available and appropriate for this bot's traffic, because the home region cannot later be casually changed and Always Free compute must be provisioned there ([current OCI Free Tier guide](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm), [Always Free resource limits and reclamation rule](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [Singapore region](https://www.oracle.com/asiasouth/cloud/cloud-regions/singapore/)). Official Lavalink supports Linux AArch64 and DAVE, so the official 4.2.2 image is compatible with an Ampere A1 VM ([official Lavalink repository](https://github.com/lavalink-devs/Lavalink), [official 4.2 changelog](https://lavalink.dev/changelog/v4)).

Run this fallback on a different VM/provider failure domain from the primary service, pin the official `4.2.2` image rather than `latest`, give it a private random password, and expose it through TLS. No password is included here because it must be generated for this deployment and kept out of committed JSON.

### Direct probe results

| Candidate | Operator authorization/evidence | Direct result on 2026-08-18 | Decision |
| --- | --- | --- | --- |
| AjieDev / Serenetia | The operator's own repository explicitly publishes a free TLS v4 node and password; its status estate monitors two public v4 nodes ([operator repository](https://github.com/AjieDev/Free-Lavalink), [operator status page](https://status.genrald.my.id/)). | TLS and authorization worked. `/version` returned `6a0df2d3eec65677d97844a87f58032b71316e43-SNAPSHOT`, not a 4.2.x semantic version. `/v4/info` reported a build/commit time of 2026-08-09 and Lavaplayer 3.0.5; `/v4/stats` returned 882 players, 54 playing, and roughly 25.7 hours uptime at the instant tested. | **Live integration-test candidate only.** The live players are evidence that it is functioning with present-day Discord, but its custom snapshot cannot be proven to be official Lavalink >=4.2.0 from the API response. It fails the strict version-verification requirement. |
| HeavenCloud public node | The provider intentionally publishes it on its own public-node page and explicitly labels free nodes as testing infrastructure ([provider public-node page](https://heavencloud.in/service/public-lavalink-servers)). | TCP connection to the published host and port was refused after retries. | Reject as fallback now. |
| TriniumHost public v4 TLS node | A current live-status site and public documentation advertise the service, but the endpoint is shared and has no free-node SLA ([operator status page](https://lavalink-status.triniumhost.com/)). | TLS negotiation failed repeatedly with an internal TLS alert, so neither `/version` nor `/v4/info` could be verified. | Reject as fallback now. |
| Current Jirayu endpoint | Jirayu/Yukimi intentionally publishes public-node service information, but the configured shared endpoint has previously been identified as 4.0.8. | Both `/version` and `/v4/info` returned HTTP 404 through the published non-TLS port during this pass. No current 4.2.x result could be obtained. | Reject. |
| Lavahost free account | The provider offers one free player and 100 plays/day through a private dashboard API key and documents the exact Shoukaku v4/TLS shape ([provider documentation](https://lavahost.net/docs), [provider pricing](https://lavahost.net/#pricing)). | No operator-public credential exists, correctly; testing requires creating an account/key. The public pages still do not state a 4.2.x version or DAVE support. | Conditional secondary candidate only after an account owner verifies `/version` >=4.2.0 and completes real voice playback. The 100-play daily cap also makes it a weak automatic fallback. |

Additional operator-published candidates checked in this pass were not viable: DevamOP and NexCloud failed DNS resolution; MilloHost blocked the request; G3V timed out; East112 refused the connection. These failures are a useful warning against treating a maintained-looking public-node list as a reliability guarantee.

### If a zero-setup shared node is temporarily unavoidable

AjieDev/Serenetia is the least-bad **temporary test** because the operator explicitly authorizes public use, TLS works, its API is live, and it had active players when probed. These exact values are repeated only because the operator deliberately publishes them:

```json
{
  "name": "serenetia-public-test",
  "url": "lavalinkv4.serenetia.com:443",
  "auth": "https://dsc.gg/ajidevserver",
  "secure": true
}
```

Do not promote it to the required fallback until the operator exposes an unambiguous 4.2.x/DAVE version or this project passes a real Discord voice test and accepts the shared-node availability/privacy risk. The **recommended required fallback remains the private OCI Always Free Lavalink 4.2.2 node**.
