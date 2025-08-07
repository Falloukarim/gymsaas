import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Politique de confidentialité - MAK Group",
  description: "Comment nous protégeons vos données"
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "Collecte des données",
      content: "Nous collectons uniquement les données nécessaires au fonctionnement de nos services."
    },
    {
      title: "Protection des données",
      content: "Vos données sont chiffrées et stockées de manière sécurisée."
    },
    // Ajoutez d'autres sections
  ];

  return (
    <div className="bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-900 dark:to-gray-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}