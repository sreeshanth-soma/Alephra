/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, Globe } from "lucide-react";
import Link from "next/link";

const LAST_UPDATED = "November 21, 2025";
const CONTACT_EMAIL = "sreeshanthsoma@gmail.com";
const SECURITY_EMAIL = CONTACT_EMAIL;

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-black rounded-2xl mb-6 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Privacy Commitment */}
        <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Our Privacy Commitment
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Alephra (the “Service”) is in an early-access pilot that helps people interpret medical information.
                  We only collect the data we need to run the product, store it in a managed PostgreSQL database we control,
                  and never sell personal information. We are not yet HIPAA-certified, so please do not upload data you
                  are not comfortable sharing with us and the processors listed below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          {/* Section 1: Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Name, email address, Google account identifier, and profile photo provided through Google OAuth sign-in.</li>
                  <li>Support messages, feedback, or bug reports that you send us directly (email, Discord, GitHub).</li>
                  <li>Device-level settings such as theme preference that may sync across sessions.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Health Information</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Medical reports, prescriptions, laboratory data, and care-plan details that you upload or enter manually.</li>
                  <li>Vitals, reminders, medications, health goals, and care-plan events stored in your account.</li>
                  <li>Voice questions and AI-generated responses when you use the multilingual voice agent (audio is sent to Sarvam AI for STT/TTS and deleted after processing unless you save transcripts).</li>
                  <li>Report summaries, extracted data, and embeddings generated for search in Pinecone.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Information</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Device, browser, and operating system metadata collected via standard HTTP headers.</li>
                  <li>IP address, approximate region, and security telemetry captured by Vercel and our logging tools to prevent abuse.</li>
                  <li>Diagnostic logs, crash traces, and performance metrics that help us debug.</li>
                  <li>Local storage caches used to speed up offline access on your device (data stays on your browser unless you sync it).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Google Calendar Integration</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>OAuth tokens scoped only to calendar access so we can create, update, or delete events on your behalf.</li>
                  <li>Event metadata (title, time, description) that you ask us to sync with Google Calendar.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
                  Primary Purpose: Deliver Health Insights
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  We process your information solely for delivering, maintaining, and improving the Service—you are always in control of your content and can delete it at any time.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service Delivery</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Parse and summarize uploaded files using Google Gemini models hosted by Google Cloud.</li>
                  <li>Embed report content and chat history into Pinecone to answer follow-up questions.</li>
                  <li>Facilitate multilingual voice interactions via Sarvam AI and text-to-speech providers.</li>
                  <li>Store reminders, appointments, vitals, and medication data in our database so dashboards can render.</li>
                  <li>Sync events with Google Calendar when you explicitly trigger that action.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service Improvement</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Monitor feature usage trends (aggregated/anonymized) to decide what to build next.</li>
                  <li>Review error logs to diagnose outages or data-processing failures.</li>
                  <li>Audit AI prompts and responses when you flag an issue so we can fix hallucinations.</li>
                  <li>Test safety guardrails and security controls.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Communication</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Send transactional emails (sign-in links, calendar alerts, alerts when a report finishes processing).</li>
                  <li>Notify you about material changes to this Policy or the Terms of Service.</li>
                  <li>Answer support requests and investigate abuse.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Data Security & Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                  Healthcare-Grade Security (In Progress)
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  We encrypt data in transit (TLS 1.3) and at rest (PostgreSQL disk encryption + encrypted object storage). Alephra is not yet HIPAA certified,
                  but we follow the same technical safeguards while we complete compliance readiness.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Safeguards</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Encryption:</strong> TLS 1.3 enforced on every endpoint; secrets stored with platform-provided KMS.</li>
                  <li><strong>Access Controls:</strong> Only two engineers have production database access; MFA enforced.</li>
                  <li><strong>Network Segmentation:</strong> API routes run on Vercel serverless functions with ephemeral containers.</li>
                  <li><strong>Secure Storage:</strong> Uploads are stored in encrypted object storage (currently Vercel Blob) with signed URLs.</li>
                  <li><strong>Monitoring:</strong> Automated alerts for unusual auth events or Pinecone misuse.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Operational Safeguards</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Least-privilege access reviews every quarter.</li>
                  <li>Security and privacy onboarding for each collaborator who can access production data.</li>
                  <li>Documented incident-response plan that includes notifying affected users within 72 hours of a confirmed breach.</li>
                  <li>Daily automated backups for PostgreSQL, Pinecone vectors, and encrypted file storage.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Data Sharing & Disclosure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="text-purple-800 dark:text-purple-200 font-semibold mb-2">
                  We Do NOT Sell Personal Data
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  We never sell, rent, or trade personal or health information for advertising. Sharing occurs only with processors who help us run the Service or when required by law.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Limited Sharing Scenarios</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">We may share your information only in these specific situations:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>AI Providers:</strong> Google Gemini APIs (OCR, reasoning) and Sarvam AI (speech) receive the data you submit to fulfill your request.</li>
                  <li><strong>Infrastructure:</strong> Vercel (hosting), managed PostgreSQL, and Vercel Blob process encrypted data to keep the Service online.</li>
                  <li><strong>Vector Search:</strong> Pinecone stores embeddings derived from your reports to enable semantic search; embeddings can be deleted by removing the source report.</li>
                  <li><strong>Calendar & Auth:</strong> Google OAuth/Calendar APIs use your tokens to authenticate and sync events.</li>
                  <li><strong>Legal or Safety:</strong> We may disclose data if required by applicable law, regulation, or government request, or to protect someone’s safety.</li>
                  <li><strong>Business Transfer:</strong> If we materially change ownership, we will notify you before your data moves to a new controller.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Google Integration</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Calendar scopes are limited to the minimum we need (create/update events you initiate).</li>
                  <li>Refresh tokens are encrypted and stored server-side; you can revoke them through your Google security settings.</li>
                  <li>Google’s <Link className="text-blue-600 dark:text-blue-400 underline" href="https://policies.google.com/privacy" target="_blank">Privacy Policy</Link> governs their handling of your data.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Your Privacy Rights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Depending on where you live, you may have rights to access, delete, or restrict the processing of your personal information. We extend these controls to every user, regardless of jurisdiction.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Access & Portability</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Export your reports, transcripts, and calendar data via in-app export or by emailing us.</li>
                    <li>• Request a full account export (JSON/CSV) by contacting {CONTACT_EMAIL}.</li>
                    <li>• Ask for details about how we processed your information.</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Control & Correction</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Edit account details, medications, reminders, and reports directly in the app.</li>
                    <li>• Revoke Google permissions at any time from your Google account.</li>
                    <li>• Opt out of emails by using unsubscribe links or contacting us.</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Deletion & Restriction</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Delete individual uploads, embeddings, or your entire account from settings.</li>
                    <li>• Request that we pause processing of specific data categories.</li>
                    <li>• Object to automated processing that meaningfully affects you.</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency & Support</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Ask questions about this policy at any time.</li>
                    <li>• File complaints with your local regulator if we fail to resolve an issue.</li>
                    <li>• Receive a response within 30 days (or faster when required by law).</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span>Data Retention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We retain information only as long as needed to provide the Service or comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Account & Health Data:</strong> Stored until you delete it or your account is inactive for 18 months; we will notify you before removal.</li>
                <li><strong>Uploaded Files:</strong> Deleted immediately when you remove them or 30 days after account deletion.</li>
                <li><strong>Voice Recordings:</strong> Sarvam AI deletes audio after generating transcripts; we keep transcripts only if you save them.</li>
                <li><strong>Embeddings & Vector Data:</strong> Deleted automatically when the source document is removed.</li>
                <li><strong>Audit Logs:</strong> Retained for up to 180 days to detect abuse, unless a longer period is required to satisfy legal obligations.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>International Data Transfers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We are based in India and operate infrastructure primarily in the United States and European Union through Vercel and cloud database vendors. When we transfer data across borders we use:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Standard Contractual Clauses (SCCs) for EU/UK personal data processed in the US.</li>
                <li>Data Processing Agreements with every processor named in this policy.</li>
                <li>Encryption and minimization to limit what leaves your region.</li>
                <li>Periodic reviews of our vendors to ensure they meet our privacy standards.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span>Children's Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                <p className="text-pink-800 dark:text-pink-200 font-semibold mb-2">
                  Age Restriction: 18+
                </p>
                <p className="text-pink-700 dark:text-pink-300 text-sm">
                  Alephra is designed for adults 18 and older. We do not knowingly collect personal information from children under 18, and the Service should not be used to manage pediatric records.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                If we learn that a child’s data is present, we will delete it immediately and disable the associated account. Please contact us if you believe a minor has provided information.
              </p>
            </CardContent>
          </Card>

          {/* Section 9: Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span>Changes to This Privacy Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy when we ship new features, onboard new processors, or need to comply with legal requirements. When that happens we will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Email the address linked to your account when there are material updates.</li>
                <li>Post a banner or in-app modal summarizing the key changes.</li>
                <li>Update the “Last updated” date and archive prior versions for reference.</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Continued use of the Service after a notice period means you accept the updated Policy. If you disagree, you can delete your account at any time.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <Shield className="w-5 h-5" />
                <span>Contact Our Privacy Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                Questions about privacy, data protection, or this document? We’re a small team and will personally respond to every request:
              </p>
              <div className="space-y-2 text-blue-700 dark:text-blue-300">
                <p><strong>Email:</strong> {CONTACT_EMAIL}</p>
                <p><strong>Security Incidents:</strong> {SECURITY_EMAIL}</p>
                <p><strong>Discord:</strong> <Link className="text-blue-700 dark:text-blue-200 underline" href="https://discord.gg/c3jtPPVh" target="_blank">Alephra Community</Link></p>
                <p><strong>GitHub Issues:</strong> <Link className="text-blue-700 dark:text-blue-200 underline" href="https://github.com/yourusername/alephra-phase1/issues" target="_blank">github.com/yourusername/alephra-phase1</Link></p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  We operate remotely from India; if you need a mailing address for regulatory reasons, email us and we will provide the appropriate contact within 5 business days.
                </p>
              </div>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Response Time:</strong> We answer privacy and deletion requests within 30 days (sooner where local law requires).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-6">
            <Link 
              href="/terms" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Terms of Service
            </Link>
            <Link 
              href="/" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
