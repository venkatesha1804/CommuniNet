import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-serif text-3xl font-bold text-maroon mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last Updated: October 2024</p>

                <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gold/10 space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to the CommuNet Community Portal. We respect your privacy and are committed to protecting
                            your personal data. This privacy policy will inform you as to how we look after your personal data
                            when you visit our website and tell you about your privacy rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Data We Collect</h2>
                        <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Identity Data:</strong> includes name, gotra, date of birth, gender.</li>
                            <li><strong>Contact Data:</strong> includes email address, telephone numbers, and residential address.</li>
                            <li><strong>Profile Data:</strong> includes your username, business details, events attended, and donations made.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Data</h2>
                        <p>
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>To register you as a new member.</li>
                            <li>To manage our relationship with you.</li>
                            <li>To enable you to partake in community events and business networking.</li>
                            <li>To administer and protect our business and this website.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@communet.com.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
