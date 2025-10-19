"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { ExpandableSkillCard } from "@/components/expandable-skill-card"
import { AppHeader } from "@/components/app-header"
import { skillsService } from "@/services/skills"

const ITEMS_PER_PAGE = 6
const SEARCH_DEBOUNCE_MS = 300

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [skills, setSkills] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState(null)
  const debounceTimer = useRef(null)

  // Функция для выполнения поиска
  const performSearch = async (query, type, page = 1) => {
    setIsLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE
      const skillType = type === "ALL" ? undefined : type

      let result

      // Если поисковая строка пуста или только пробелы, получаем все навыки
      if (!query || query.trim() === "") {
        result = await skillsService.getAllSkills({
          skillType,
          limit: ITEMS_PER_PAGE,
          offset,
        })
      } else {
        // Иначе используем векторный поиск
        result = await skillsService.vectorSearchSkills(query, {
          skillType,
          limit: ITEMS_PER_PAGE,
          offset,
        })
      }

      setSkills(result || [])

      // Получаем общее количество из заголовка X-Total-Count
      // Если заголовок недоступен, используем длину результатов
      setTotalCount(result?.length || 0)
    } catch (err) {
      console.error("Search error:", err)
      setError("Ошибка при поиске навыков. Попробуйте позже.")
      setSkills([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced поиск при изменении query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1)
      performSearch(searchQuery, typeFilter, 1)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery, typeFilter])

  // Загрузка при изменении страницы
  useEffect(() => {
    if (currentPage > 1) {
      performSearch(searchQuery, typeFilter, currentPage)
    }
  }, [currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1)
      performSearch(searchQuery, typeFilter, 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Поиск навыков</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Найдите людей, которые могут научить вас новым навыкам
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8 border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Поиск по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Все типы</SelectItem>
                  <SelectItem value="OUTGOING">Обучают</SelectItem>
                  <SelectItem value="INCOMING">Хотят изучить</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => performSearch(searchQuery, typeFilter, 1)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Найти
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                Найдено результатов: <span className="font-semibold text-foreground">{totalCount}</span>
              </>
            )}
          </p>
        </div>

        {/* Skills Grid or Empty State */}
        {!isLoading && skills.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery.trim() === "" && typeFilter === "ALL"
                  ? "Нет доступных навыков"
                  : "Навыки не найдены. Попробуйте изменить параметры поиска."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {skills.map((skill) => (
                <ExpandableSkillCard key={skill.id} skill={skill} showUserInfo={true} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = currentPage > 3 ? currentPage - 2 + i : i + 1
                    return page <= totalPages ? (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                        disabled={isLoading}
                      >
                        {page}
                      </Button>
                    ) : null
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
