/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

const LAST_UPDATED = "November 21, 2025";
const CONTACT_EMAIL = "sreeshanthsoma@gmail.com";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-black rounded-2xl mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  Important Medical Disclaimer
                </h3>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Alephra is an experimental AI companion that helps you understand personal medical information. 
                  We do not provide medical care, diagnoses, or prescriptions, and the Service is not certified as a medical device. 
                  All clinical decisions must be made by licensed professionals who can evaluate your specific situation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          {/* Section 1: Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                By accessing or using Alephra (the “Service”), including via web, mobile, or API, you acknowledge that you have read, understand, and agree to be bound by these Terms and by our{" "}
                <Link className="text-blue-600 dark:text-blue-400 underline" href="/privacy">Privacy Policy</Link>.
                If you do not agree, do not use the Service. You may only use Alephra where doing so is lawful.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms are between you and the Alephra maintainers (currently the MedScan Phase 1 team). We may update them from time to time following the process described below.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Description of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                <span>Description of Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Alephra is an AI-powered healthcare companion that currently offers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Medical report uploads, OCR, and summarization powered by Google Gemini APIs.</li>
                <li>Multilingual voice input/output processed through Sarvam AI and browser speech tools.</li>
                <li>Care-plan tracking, medication reminders, vitals logging, and dashboard visualizations.</li>
                <li>Calendar syncing via Google Calendar (optional) and shareable report links.</li>
                <li>Contextual chat, Q&A, and recommendations generated using embeddings stored in Pinecone.</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                The Service supplements—not replaces—your relationship with licensed healthcare professionals.
              </p>
            </CardContent>
          </Card>

          {/* Section 3: Medical Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-sm">3</span>
                <span>Medical Disclaimer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                  NOT A MEDICAL DEVICE OR PROFESSIONAL MEDICAL ADVICE
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Alephra is not cleared or approved by the FDA, CDSCO, EMA, or any other regulator. Output may be incorrect, incomplete, or outdated. 
                  Never delay or avoid seeking professional medical advice because of something you read inside Alephra.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Always consult a licensed clinician who can consider your full medical history.</li>
                <li>Contact local emergency services immediately if you believe you are experiencing a medical emergency.</li>
                <li>Use outputs for education and preparation—not diagnosis or treatment.</li>
                <li>Report incorrect or unsafe responses via in-app feedback so we can improve safeguards.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4: User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">4</span>
                <span>User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Provide accurate information about yourself and only upload content that you have the right to share.</li>
                <li>Use the Service solely for personal, non-commercial health-management purposes unless you obtain our written consent.</li>
                <li>Keep your account credentials secure and notify us immediately of any unauthorized access.</li>
                <li>Respect intellectual property rights and all applicable laws, including privacy laws covering other people’s data.</li>
                <li>Refrain from probing or testing the Service for vulnerabilities except through our coordinated disclosure process.</li>
                <li>Report bugs, safety issues, or abusive behavior via {CONTACT_EMAIL} or GitHub issues.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5: Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">5</span>
                <span>Privacy and Data Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Your use of Alephra is subject to our {" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </Link>{" "}
                which explains what we collect, why, and how to exercise your rights. By using the Service you consent to those practices.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                  Health Data Security
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  We encrypt data in transit and at rest, limit engineer access, and review processors regularly. Alephra is not yet HIPAA certified; you are responsible for validating whether the Service meets your compliance needs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">6</span>
                <span>Intellectual Property</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                The Service, including text, graphics, UI components, and source code, is owned by the Alephra contributors and protected by intellectual-property laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You retain ownership of the content you upload. You grant us a limited, revocable, worldwide license to host, process, transform, and transmit that content solely to provide and improve the Service. We may use aggregated and de-identified data to improve quality, provided it cannot reasonably identify you.
              </p>
            </CardContent>
          </Card>

          {/* Section 7: Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold text-sm">7</span>
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                  IMPORTANT LIMITATION
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  To the maximum extent permitted by applicable law, Alephra and its contributors are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages—or any loss of data, profit, or goodwill—arising from or related to your use of the Service.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                The Service is provided “as is,” without warranties of any kind—express or implied—including merchantability, fitness for a particular purpose, quiet enjoyment, accuracy, or non-infringement. We do not warrant uninterrupted availability or that defects will be corrected.
              </p>
            </CardContent>
          </Card>

          {/* Section 8: Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">8</span>
                <span>Termination</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We may suspend or terminate your account immediately (with notice when feasible) if we believe you violated these Terms, compromised security, uploaded unlawful content, or engaged in abusive behavior.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You may delete your account at any time via in-app settings or by emailing {CONTACT_EMAIL}. Termination does not relieve you of obligations incurred before the effective date.
              </p>
            </CardContent>
          </Card>

          {/* Section 9: Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">9</span>
                <span>Changes to Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We may update these Terms when we release new features, onboard new processors, or respond to legal requirements. We will notify you via email or in-app notice before material changes take effect. Continued use after the effective date means you accept the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Section 10: Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">10</span>
                <span>Third-Party Services & Open Source</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Alephra relies on external APIs and infrastructure. By using the Service you also agree to the terms and privacy notices of:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Google OAuth and Google Calendar (authentication and scheduling).</li>
                <li>Google Gemini APIs (OCR, reasoning, and embeddings).</li>
                <li>Sarvam AI and browser speech APIs (speech recognition and synthesis).</li>
                <li>Pinecone (vector database) and Vercel (hosting, logging, analytics).</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                The Service includes open-source components licensed by their respective authors. Those licenses govern your use of those components. If a conflict exists between these Terms and an open-source license, the open-source license controls for that component.
              </p>
            </CardContent>
          </Card>

          {/* Section 11: Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">11</span>
                <span>Governing Law & Dispute Resolution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                These Terms are governed by the laws of India, without regard to conflict-of-law principles. If you access the Service from another jurisdiction you are responsible for complying with local laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We prefer to resolve disputes amicably. Please contact us first so we can try to work things out. If we cannot, any dispute must be brought in the courts located in Hyderabad, Telangana, India, and you consent to their jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* Section 12: Contact */}

          {/* Contact Information */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <Shield className="w-5 h-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 dark:text-blue-300">
                Questions about these Terms, notices of infringement, or security concerns can be sent to:
              </p>
              <div className="mt-4 space-y-2 text-blue-700 dark:text-blue-300">
                <p><strong>Email:</strong> {CONTACT_EMAIL}</p>
                <p><strong>Discord:</strong> <Link className="text-blue-700 dark:text-blue-200 underline" href="https://discord.gg/c3jtPPVh" target="_blank">Alephra Community</Link></p>
                <p><strong>GitHub:</strong> <Link className="text-blue-700 dark:text-blue-200 underline" href="https://github.com/yourusername/alephra-phase1/issues" target="_blank">Open an issue</Link></p>
                <p className="text-sm">
                  We operate as a remote-first team in India. If you require a physical mailing address for legal correspondence, email us and we will provide the appropriate contact details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-6">
            <Link 
              href="/privacy" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Privacy Policy
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
