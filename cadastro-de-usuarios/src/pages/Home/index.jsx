import { useEffect, useState, useRef } from 'react'
import './style.css'
import Trash from '../../assets/trashh.svg'
import api from '../../services/api'

function Home() {
  const [users, setUsers] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputName = useRef()
  const inputAge = useRef()
  const inputEmail = useRef()

  async function getUsers() {
    const usersFromApi = await api.get('/usuarios')
    setUsers(usersFromApi.data)
  }

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email)
  }

  async function createUsers() {
    const name = inputName.current.value.trim()
    const age = inputAge.current.value
    const email = inputEmail.current.value.trim().toLowerCase()

    if (!name) {
      setErrorMessage('O nome é obrigatório.')
      setSuccessMessage('')
      return
    }

    if (!age) {
      setErrorMessage('A idade é obrigatória.')
      setSuccessMessage('')
      return
    }

    if (Number(age) <= 0) {
      setErrorMessage('A idade deve ser maior que 0.')
      setSuccessMessage('')
      return
    }

    if (Number(age) > 100) {
      setErrorMessage('A idade esta invalida!')
      setSuccessMessage('')
      return
    }

    if (!email) {
      setErrorMessage('O e-mail é obrigatório.')
      setSuccessMessage('')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('Digite um e-mail válido.')
      setSuccessMessage('')
      return
    }

    const emailAlreadyExists = users.some(
      user => user.email && user.email.toLowerCase() === email
    )

    if (emailAlreadyExists) {
      setErrorMessage('Este e-mail já está cadastrado.')
      setSuccessMessage('')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    try {
      setLoading(true)

      await api.post('/usuarios', {
        name,
        age,
        email
      })

      await getUsers()

      inputName.current.value = ''
      inputAge.current.value = ''
      inputEmail.current.value = ''

      setSuccessMessage('Usuário cadastrado com sucesso!')
    } catch (error) {
      console.log(error)
      setErrorMessage(error.response?.data?.message || 'Erro ao cadastrar usuário.')
      setSuccessMessage('')
    } finally {
      setLoading(false)
    }
  }

  async function deleteUsers(id) {
    try {
      await api.delete(`/usuarios/${id}`)
      await getUsers()
      setErrorMessage('')
      setSuccessMessage('Usuário deletado com sucesso!')
    } catch (error) {
      console.log(error)
      setErrorMessage(error.response?.data?.message || 'Erro ao deletar usuário.')
      setSuccessMessage('')
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  useEffect(() => {
    if (errorMessage) {
      setShowError(true)

      const hideTimer = setTimeout(() => {
        setShowError(false)
      }, 2500)

      const removeTimer = setTimeout(() => {
        setErrorMessage('')
      }, 3000)

      return () => {
        clearTimeout(hideTimer)
        clearTimeout(removeTimer)
      }
    }
  }, [errorMessage])

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true)

      const hideTimer = setTimeout(() => {
        setShowSuccess(false)
      }, 2500)

      const removeTimer = setTimeout(() => {
        setSuccessMessage('')
      }, 3000)

      return () => {
        clearTimeout(hideTimer)
        clearTimeout(removeTimer)
      }
    }
  }, [successMessage])

  return (
    <div className='container'>
      <div className="toast-container">
        {errorMessage && (
          <div className={`toast-message toast-error ${showError ? 'show' : 'hide'}`}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className={`toast-message toast-success ${showSuccess ? 'show' : 'hide'}`}>
            {successMessage}
          </div>
        )}
      </div>

      <form noValidate>
        <h1>Cadastro de Usuários</h1>
        <input placeholder="Nome" name="nome" type="text" ref={inputName} />
        <input placeholder="Idade" name="idade" type="number" ref={inputAge} />
        <input placeholder="E-mail" name="email" type="email" ref={inputEmail} />

        <button type="button" onClick={createUsers} disabled={loading}>
          {loading ? 'Carregando...' : 'Cadastrar'}
        </button>
      </form>

      {users.map(user => (
        <div key={user.id} className="card">
          <div>
            <p>Nome: <span>{user.name}</span></p>
            <p>Idade: <span>{user.age}</span></p>
            <p>Email: <span>{user.email}</span></p>
          </div>
          <button type="button" onClick={() => deleteUsers(user.id)} className="delete-btn">
            <img src={Trash} alt='deletar' />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Home