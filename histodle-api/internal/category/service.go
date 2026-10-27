package category

type Service struct {
    repository *Repository
}

func NewService(repository *Repository) *Service {
    return &Service{repository: repository}
}

func (service *Service) List() ([]Category, error) {
    return service.repository.FindAll()
}