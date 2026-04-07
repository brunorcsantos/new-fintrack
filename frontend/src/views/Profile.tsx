"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Camera, Check, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "Joao Silva",
    email: "joao@email.com",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)
    setProfileSuccess(false)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoadingProfile(false)
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingPassword(true)
    setPasswordSuccess(false)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoadingPassword(false)
    setPasswordSuccess(true)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const passwordsMatch =
    passwordData.newPassword === passwordData.confirmPassword

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Meu Perfil"
        description="Gerencie suas informacoes pessoais"
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-2xl">
        {/* Avatar Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    JS
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {profileData.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde Janeiro 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informacoes Pessoais</CardTitle>
            <CardDescription>
              Atualize seu nome e email de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isLoadingProfile}>
                  {isLoadingProfile ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alteracoes"
                  )}
                </Button>
                {profileSuccess && (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <Check className="h-4 w-4" />
                    Salvo com sucesso!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alterar Senha</CardTitle>
            <CardDescription>
              Mantenha sua conta segura com uma senha forte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  aria-invalid={!!passwordData.confirmPassword && !passwordsMatch}
                />
                {passwordData.confirmPassword && !passwordsMatch && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    As senhas nao coincidem
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={isLoadingPassword || !passwordsMatch}
                >
                  {isLoadingPassword ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Alterando...
                    </>
                  ) : (
                    "Alterar Senha"
                  )}
                </Button>
                {passwordSuccess && (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <Check className="h-4 w-4" />
                    Senha alterada!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Acoes irreversiveis para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Excluir Conta</p>
                <p className="text-sm text-muted-foreground">
                  Exclua permanentemente sua conta e todos os dados
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
