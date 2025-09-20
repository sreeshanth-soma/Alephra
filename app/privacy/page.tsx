/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, UserCheck, Globe } from "lucide-react";
import Link from "next/link";

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
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                  Your health data is deeply personal. We implement the highest standards of security and privacy 
                  to protect your information, following healthcare industry best practices and regulatory requirements.
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
                  <li>Name, email address, and profile picture (via Google OAuth)</li>
                  <li>Account preferences and settings</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Health Information</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Medical reports and documents you upload</li>
                  <li>Voice recordings of health consultations</li>
                  <li>Health questions and AI-generated responses</li>
                  <li>Appointment and reminder data</li>
                  <li>Health insights and analysis results</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Information</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and location data (general location only)</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Error logs and performance metrics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Google Calendar Integration</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Calendar events you create through MedScan</li>
                  <li>Access tokens for calendar synchronization</li>
                  <li>Appointment scheduling preferences</li>
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
                  Primary Purpose: Healthcare Services
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  We use your information solely to provide and improve our AI-powered healthcare services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service Delivery</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Analyze medical reports using AI algorithms</li>
                  <li>Provide voice-based health consultations</li>
                  <li>Generate personalized health insights and recommendations</li>
                  <li>Schedule appointments and send reminders</li>
                  <li>Synchronize with your Google Calendar</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service Improvement</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Improve AI model accuracy and performance</li>
                  <li>Enhance user experience and interface design</li>
                  <li>Develop new features and capabilities</li>
                  <li>Ensure system security and reliability</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Communication</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Send appointment reminders and health notifications</li>
                  <li>Provide customer support and assistance</li>
                  <li>Share important service updates and security alerts</li>
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
                  Healthcare-Grade Security
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  We implement security measures that meet or exceed healthcare industry standards, 
                  including HIPAA-compliant practices where applicable.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Safeguards</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                  <li><strong>Data Isolation:</strong> Your data is logically separated from other users</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li><strong>Secure Infrastructure:</strong> Cloud services with SOC 2 Type II compliance</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Operational Safeguards</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Limited employee access on a need-to-know basis</li>
                  <li>Regular security training for all team members</li>
                  <li>Incident response procedures and breach notification protocols</li>
                  <li>Data backup and disaster recovery procedures</li>
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
                  We Do NOT Sell Your Data
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  We never sell, rent, or trade your personal or health information to third parties for marketing purposes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Limited Sharing Scenarios</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3">We may share your information only in these specific situations:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate the service (e.g., cloud hosting, AI processing)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Safety Protection:</strong> To protect the safety of users or the public</li>
                  <li><strong>Business Transfer:</strong> In case of merger, acquisition, or asset sale (with user notification)</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Google Integration</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Calendar data is synced directly with your Google Calendar</li>
                  <li>We use Google OAuth for secure authentication</li>
                  <li>Google's privacy policy also applies to their services</li>
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
                You have the following rights regarding your personal information:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Access & Portability</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Request a copy of your data</li>
                    <li>• Download your information</li>
                    <li>• View data processing activities</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Control & Correction</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Update or correct your information</li>
                    <li>• Opt-out of communications</li>
                    <li>• Manage privacy settings</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Deletion & Restriction</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Delete your account and data</li>
                    <li>• Restrict certain data processing</li>
                    <li>• Object to specific uses</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency & Support</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Understand how data is used</li>
                    <li>• Contact our privacy team</li>
                    <li>• File privacy complaints</li>
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
                We retain your information only as long as necessary to provide services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Active Account Data:</strong> Retained while your account is active</li>
                <li><strong>Health Records:</strong> Retained for 7 years or as required by healthcare regulations</li>
                <li><strong>Voice Recordings:</strong> Processed and deleted within 30 days unless saved by user</li>
                <li><strong>Technical Logs:</strong> Retained for 90 days for security and debugging purposes</li>
                <li><strong>Deleted Accounts:</strong> Data permanently deleted within 30 days of account deletion</li>
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
                MedScan operates globally and may transfer your data across borders to provide our services. 
                We ensure appropriate safeguards are in place for international transfers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Adequacy decisions for transfers to approved countries</li>
                <li>Additional security measures for sensitive health data</li>
                <li>Regular compliance assessments for international operations</li>
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
                  MedScan is intended for adults aged 18 and older. We do not knowingly collect personal information from children under 18.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                If we become aware that we have collected personal information from a child under 18, 
                we will take steps to delete such information promptly. If you believe we have collected 
                information from a child, please contact us immediately.
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
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice in the MedScan application</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Continued use of MedScan after changes constitutes acceptance of the updated Privacy Policy.
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
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-blue-700 dark:text-blue-300">
                <p><strong>Privacy Officer:</strong> privacy@medscan.ai</p>
                <p><strong>Data Protection:</strong> dpo@medscan.ai</p>
                <p><strong>General Support:</strong> support@medscan.ai</p>
                <p><strong>Mailing Address:</strong></p>
                <div className="ml-4">
                  <p>MedScan Privacy Team</p>
                  <p>Data Protection Office</p>
                  <p>[Your Company Address]</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Response Time:</strong> We will respond to privacy requests within 30 days, 
                  or sooner as required by applicable law.
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
