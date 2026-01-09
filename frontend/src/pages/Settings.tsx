import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const { user, logout, isAdmin, isSeller, isSuperAdmin } = useAuth();
  const nav = useNavigate();
  const roleLabel = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : isSeller ? 'Vendeur' : 'Utilisateur';

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-600">Profil: {roleLabel}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Paramètres communs</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Compte utilisateur</h3>
              <p className="text-sm text-gray-600">Gérer votre profil et vos accès.</p>
            </div>
            <div className="grid gap-3">
              <label className="text-sm text-gray-600">
                Nom
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue={user?.name || ''}
                  placeholder="Votre nom"
                />
              </label>
              <label className="text-sm text-gray-600">
                Nom d'entreprise
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                  value={user?.companyName || ''}
                  readOnly
                />
              </label>
              <label className="text-sm text-gray-600">
                Email
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                  value={user?.email || ''}
                  readOnly
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" type="button">
                  Changer le mot de passe
                </Button>
                <Button variant="secondary" type="button" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Contrôle rapide des alertes.</p>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" defaultChecked />
                Activer les notifications
              </label>
              <Button variant="ghost" type="button" className="w-fit">
                Marquer toutes comme lues
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4 lg:col-span-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Préférences d'affichage</h3>
              <p className="text-sm text-gray-600">Personnalisez votre interface.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Mode sombre
              </label>
              <label>
                Langue
                <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                </select>
              </label>
              <label>
                Format date & monnaie
                <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="fcfa">FCFA</option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                </select>
              </label>
            </div>
          </Card>
        </div>
      </section>

      {isSeller && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Paramètres vendeur</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Préférences vendeur</h3>
                <p className="text-sm text-gray-600">Simplicité maximale pour vos ventes.</p>
              </div>
              <div className="grid gap-3 text-sm text-gray-600">
                <label>
                  Méthode de paiement par défaut
                  <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Cash</option>
                    <option>Mobile Money</option>
                  </select>
                </label>
                <label>
                  Montant suggéré
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 5000"
                  />
                </label>
                <label>
                  Client par défaut (optionnel)
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Client rapide"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Transactions rapides</h3>
                <p className="text-sm text-gray-600">Activez les raccourcis de vente.</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Activer l'ajout rapide
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Bouton flottant
                </label>
              </div>
            </Card>
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Paramètres admin</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Entreprise</h3>
                <p className="text-sm text-gray-600">Identité et contact de l'entreprise.</p>
              </div>
              <div className="grid gap-3 text-sm text-gray-600">
                <label>
                  Nom de l'entreprise
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Kawari Shop"
                  />
                </label>
                <label>
                  Logo
                  <input type="file" className="mt-1 w-full text-sm text-gray-600" />
                </label>
                <label>
                  Devise
                  <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>FCFA</option>
                    <option>EUR</option>
                    <option>USD</option>
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    Téléphone
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+225 00 00 00 00"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="contact@entreprise.com"
                    />
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Gestion des vendeurs</h3>
                <p className="text-sm text-gray-600">Contrôle des accès vendeurs.</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Activer / désactiver un vendeur
                </label>
                <label>
                  Limiter accès
                  <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Complet</option>
                    <option>Stats seulement</option>
                    <option>Ventes seulement</option>
                  </select>
                </label>
                <Button variant="ghost" type="button" className="w-fit">
                  Réinitialiser mot de passe
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Règles business</h3>
                <p className="text-sm text-gray-600">Modules disponibles et catégories.</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Activer facturation
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Activer dépenses
                </label>
                <label>
                  Catégories de transactions
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Services, Loyer, Marketing"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Sécurité</h3>
                <p className="text-sm text-gray-600">Paramètres de session et historiques.</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Forcer déconnexion vendeurs
                </label>
                <label>
                  Durée de session (minutes)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="120"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Historique connexions (optionnel)
                </label>
              </div>
            </Card>
          </div>
        </section>
      )}

      {isSuperAdmin && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Paramètres super admin</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Plateforme Kawari</h3>
                <p className="text-sm text-gray-600">Gestion des entreprises clientes.</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="rounded-lg border border-gray-300 bg-white p-3">
                  <p className="font-medium text-gray-900">Liste des entreprises</p>
                  <p className="text-xs text-gray-500">Aperçu rapide des comptes.</p>
                </div>
                <Button variant="ghost" type="button" className="w-fit">
                  Activer / suspendre une entreprise
                </Button>
                <Button variant="ghost" type="button" className="w-fit">
                  Forcer reset admin
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Monitoring</h3>
                <p className="text-sm text-gray-600">Visibilité globale de la plateforme.</p>
              </div>
              <div className="grid gap-3 text-sm text-gray-600">
                <div className="rounded-lg border border-gray-300 bg-white p-3">
                  <p className="text-xs text-gray-500">Entreprises actives</p>
                  <p className="text-lg font-semibold text-gray-900">--</p>
                </div>
                <div className="rounded-lg border border-gray-300 bg-white p-3">
                  <p className="text-xs text-gray-500">Activite globale</p>
                  <p className="text-lg font-semibold text-gray-900">--</p>
                </div>
                <div className="rounded-lg border border-gray-300 bg-white p-3">
                  <p className="text-xs text-gray-500">Logs système</p>
                  <p className="text-sm text-gray-600">Aucun log chargé.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
