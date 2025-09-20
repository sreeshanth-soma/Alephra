/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

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
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                  MedScan is an AI-powered healthcare assistant designed to provide information and insights. 
                  It is NOT a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult with qualified healthcare professionals for medical decisions.
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
                By accessing and using MedScan ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms of Service constitute a legally binding agreement between you and MedScan regarding your use of the Service.
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
                MedScan is an AI-powered healthcare platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Medical report analysis and interpretation using artificial intelligence</li>
                <li>Voice-based health consultations in multiple languages</li>
                <li>Appointment scheduling with Google Calendar integration</li>
                <li>Health reminders and medication tracking</li>
                <li>Personalized health insights and recommendations</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                The Service is designed to supplement, not replace, the relationship between you and your healthcare providers.
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
                  MedScan is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease. 
                  The information provided is for educational and informational purposes only.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Always consult with qualified healthcare professionals for medical advice</li>
                <li>Do not disregard professional medical advice based on information from MedScan</li>
                <li>In case of medical emergencies, contact emergency services immediately</li>
                <li>AI-generated insights may contain errors or inaccuracies</li>
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
                <li>Provide accurate and truthful information when using the Service</li>
                <li>Use the Service only for lawful purposes</li>
                <li>Not attempt to reverse engineer or compromise the security of the Service</li>
                <li>Respect the intellectual property rights of MedScan and third parties</li>
                <li>Not share your account credentials with others</li>
                <li>Report any security vulnerabilities or inappropriate content</li>
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
                Your privacy is important to us. Our collection and use of your personal information is governed by our{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                  Health Data Security
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  We implement industry-standard security measures to protect your health information, 
                  including encryption, access controls, and secure data transmission protocols.
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
                The Service and its original content, features, and functionality are and will remain the exclusive property of MedScan and its licensors. 
                The Service is protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You retain ownership of any health data you provide, but grant us a license to process it for providing the Service.
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
                  To the fullest extent permitted by law, MedScan shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                  or other intangible losses resulting from your use of the Service.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                We make no warranties about the accuracy, completeness, or reliability of AI-generated health insights.
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
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You may terminate your account at any time by contacting us or using the account deletion feature in the Service.
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
                We reserve the right to modify these Terms at any time. We will notify users of significant changes 
                via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

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
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2 text-blue-700 dark:text-blue-300">
                <p><strong>Email:</strong> legal@medscan.ai</p>
                <p><strong>Support:</strong> support@medscan.ai</p>
                <p><strong>Address:</strong> MedScan Legal Department</p>
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
