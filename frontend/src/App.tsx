import { LoginForm } from './components/Login/LoginForm'
import { CourseList } from './components/Course/CourseList'
import { Provider } from './components/ui/provider'
import { Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { ReviewForm } from './components/Review/ReviewForm'
import { AdminReviewPage } from './components/Review/AdminReviewPage'
import { AuthProvider } from './components/contexts/AuthContext'
import { UserAccount } from './components/UserAccount/UserAccount'
export const BASE_URL = import.meta.env.MODE === 'development' ? 'http://25.34.90.227:8080/api' : ''

function App() {
  return (
    <>
      <Router>
        <Provider>
          <AuthProvider>
            <Box
              minH="100vh" // На всю высоту экрана
              bg="blue.50" // или просто bg="blue.50"
              bgSize="cover"
              bgRepeat="no-repeat"
            >
              <Header />
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <LoginForm />
                    </>
                  }
                />
                <Route
                  path="/courseList"
                  element={
                    <>
                      <CourseList />
                    </>
                  }
                ></Route>
                <Route
                  path="/reviewForm/:courseId"
                  element={
                    <>
                      <ReviewForm />
                    </>
                  }
                ></Route>
                <Route
                  path="/adminReviewPage/:courseId"
                  element={
                    <>
                      <AdminReviewPage />
                    </>
                  }
                ></Route>
                <Route
                  path="/UserAccount/:userId"
                  element={
                    <>
                      <UserAccount />
                    </>
                  }
                ></Route>
              </Routes>
            </Box>
          </AuthProvider>
        </Provider>
      </Router>
    </>
  )
}
export default App
