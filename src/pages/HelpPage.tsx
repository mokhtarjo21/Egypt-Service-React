import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  CreditCard,
  User,
  Settings,
  Bell,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useDirection } from "../hooks/useDirection";

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const faqCategories = [
    {
      id: "getting-started",
      titleKey: "helpPage.categories.gettingStarted.title",
      icon: User,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
      questions: [
        {
          questionKey:
            "helpPage.categories.gettingStarted.questions.howToRegister",
          answerKey: "helpPage.categories.gettingStarted.answers.howToRegister",
        },
        {
          questionKey:
            "helpPage.categories.gettingStarted.questions.howToVerify",
          answerKey: "helpPage.categories.gettingStarted.answers.howToVerify",
        },
        {
          questionKey:
            "helpPage.categories.gettingStarted.questions.howToAddService",
          answerKey:
            "helpPage.categories.gettingStarted.answers.howToAddService",
        },
      ],
    },
    {
      id: "services",
      titleKey: "helpPage.categories.services.title",
      icon: Settings,
      color: "text-secondary-600",
      bgColor: "bg-secondary-100",
      questions: [
        {
          questionKey: "helpPage.categories.services.questions.howToSearch",
          answerKey: "helpPage.categories.services.answers.howToSearch",
        },
        {
          questionKey: "helpPage.categories.services.questions.howToBook",
          answerKey: "helpPage.categories.services.answers.howToBook",
        },
        {
          questionKey: "helpPage.categories.services.questions.howToReview",
          answerKey: "helpPage.categories.services.answers.howToReview",
        },
      ],
    },
    {
      id: "payments",
      titleKey: "helpPage.categories.payments.title",
      icon: CreditCard,
      color: "text-accent-600",
      bgColor: "bg-accent-100",
      questions: [
        {
          questionKey: "helpPage.categories.payments.questions.paymentMethods",
          answerKey: "helpPage.categories.payments.answers.paymentMethods",
        },
        {
          questionKey: "helpPage.categories.payments.questions.refundPolicy",
          answerKey: "helpPage.categories.payments.answers.refundPolicy",
        },
        {
          questionKey: "helpPage.categories.payments.questions.subscription",
          answerKey: "helpPage.categories.payments.answers.subscription",
        },
      ],
    },
    {
      id: "safety",
      titleKey: "helpPage.categories.safety.title",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
      questions: [
        {
          questionKey: "helpPage.categories.safety.questions.howToReport",
          answerKey: "helpPage.categories.safety.answers.howToReport",
        },
        {
          questionKey: "helpPage.categories.safety.questions.verifiedProviders",
          answerKey: "helpPage.categories.safety.answers.verifiedProviders",
        },
        {
          questionKey: "helpPage.categories.safety.questions.dataPrivacy",
          answerKey: "helpPage.categories.safety.answers.dataPrivacy",
        },
      ],
    },
    {
      id: "account",
      titleKey: "helpPage.categories.account.title",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      questions: [
        {
          questionKey: "helpPage.categories.account.questions.changePassword",
          answerKey: "helpPage.categories.account.answers.changePassword",
        },
        {
          questionKey: "helpPage.categories.account.questions.updateProfile",
          answerKey: "helpPage.categories.account.answers.updateProfile",
        },
        {
          questionKey: "helpPage.categories.account.questions.deleteAccount",
          answerKey: "helpPage.categories.account.answers.deleteAccount",
        },
      ],
    },
    {
      id: "notifications",
      titleKey: "helpPage.categories.notifications.title",
      icon: Bell,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      questions: [
        {
          questionKey:
            "helpPage.categories.notifications.questions.manageNotifications",
          answerKey:
            "helpPage.categories.notifications.answers.manageNotifications",
        },
        {
          questionKey:
            "helpPage.categories.notifications.questions.emailNotifications",
          answerKey:
            "helpPage.categories.notifications.answers.emailNotifications",
        },
      ],
    },
  ];

  const quickLinks = [
    {
      href: "/contact",
      label: t("helpPage.quickLinks.contactSupport"),
      icon: MessageSquare,
    },
    {
      href: "/policies/terms",
      label: t("helpPage.quickLinks.termsOfService"),
      icon: FileText,
    },
    {
      href: "/policies/privacy",
      label: t("helpPage.quickLinks.privacyPolicy"),
      icon: Shield,
    },
    { href: "/about", label: t("helpPage.quickLinks.aboutUs"), icon: BookOpen },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <HelpCircle className="w-16 h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("helpPage.hero.title")}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              {t("helpPage.hero.subtitle")}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? "right-4" : "left-4"}`}
                />
                <Input
                  type="text"
                  placeholder={t("helpPage.hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 text-lg`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  to={link.href}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Icon className="w-6 h-6 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("helpPage.faq.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("helpPage.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;

              return (
                <Card key={category.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full ${category.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {t(category.titleKey)}
                      </h3>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : isRTL ? (
                      <ChevronLeft className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      <div className="pt-6 space-y-4">
                        {category.questions.map((faq, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {t(faq.questionKey)}
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                              {t(faq.answerKey)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("helpPage.contact.title")}
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {t("helpPage.contact.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" leftIcon={<Mail className="w-5 h-5" />}>
                    {t("helpPage.contact.emailUs")}
                  </Button>
                </Link>
                <a href="tel:+201000000000">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Phone className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    {t("helpPage.contact.callUs")}
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
