
import { useEffect, useState } from 'react'
import './App.css'

const API = 'https://ed-tech-online-learning.onrender.com/api'

function App() {
  const [page, setPage] = useState('home')
  const [search, setSearch] = useState('')
  const [courses, setCourses] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [courseOrigin, setCourseOrigin] = useState('home')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetch(`${API}/courses/`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load courses')
        return response.json()
      })
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError('Unable to load courses. Check the backend server.'))
      .finally(() => setLoading(false))

    const token = localStorage.getItem('access_token')

    if (token) {
      fetch(`${API}/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Session expired')
          return response.json()
        })
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem('access_token'))
    }
  }, [])

  async function handleAuth(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)

    const isRegister = page === 'register'
    const endpoint = isRegister ? 'register/' : 'login/'

    const body = isRegister
      ? { name: name.trim(), email: email.trim(), password }
      : { email: email.trim(), password }

    try {
      const response = await fetch(`${API}/users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (isRegister) {
        setMessage('Registration successful! Please log in.')
        setName('')
        setEmail('')
        setPassword('')
        setPage('login')
      } else {
        localStorage.setItem('access_token', data.access_token)

        const profileResponse = await fetch(`${API}/users/profile/`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        })

        if (!profileResponse.ok) {
          throw new Error('Login succeeded, but profile could not be loaded.')
        }

        const profileData = await profileResponse.json()       
        setUser(profileData)
                setPassword('')
                setMessage('Login successful!')
                setPage('home')
              }
            } catch (err) {
              setError(err.message || 'Unable to connect to the server.')
            } finally {
              setSubmitting(false)
            }
          }
        
          async function viewCourse(courseId) {
            setMessage('')
            setError('')
            setCourseOrigin(page)
            setSelectedCourse(null)
            setDetailLoading(true)
            setPage('course-details')
        
            try {
              const response = await fetch(`${API}/courses/${courseId}/`)
              const data = await response.json()
        
              if (!response.ok) {
                throw new Error(data.error || 'Could not load course details.')
              }
        
              setSelectedCourse(data)
            } catch (err) {
              setError(err.message || 'Unable to load course details.')
            } finally {
              setDetailLoading(false)
            }
          }
        
          async function enrollInCourse() {
            setMessage('')
            setError('')
        
            if (!user) {
              setMessage('Please log in before enrolling in a course.')
              setPage('login')
              return
            }
        
            if (!selectedCourse?._id || !user.email) {
              setError('Course or user details are missing. Please try again.')
              return
            }
        
            setEnrolling(true)
        
            try { 
               const response = await fetch(`${API}/enrollments/enroll/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: user.email,
                      course_id: selectedCourse._id,
                    }),
                  })
            
                  const data = await response.json()

                  console.log('Enrollment status:', response.status)
                  console.log('Enrollment request:', {
                    email: user.email,
                    course_id: selectedCourse._id,
                  })
                  console.log('Enrollment response:', data)

                  if (!response.ok) {
                    throw new Error(data.error || 'Could not enroll in this course.')
                  }
                              
                  setMessage(data.message || 'Enrolled successfully! You can find this course in My Learning.')
                  setMyCourses((current) =>
                    current.some((course) => course._id === selectedCourse._id)
                      ? current
                      : [...current, selectedCourse]
                  )
                } catch (err) {
                  setError(err.message || 'Unable to enroll in this course.')
                } finally {
                  setEnrolling(false)
                }
              }
            
              async function loadMyCourses() {
                const token = localStorage.getItem('access_token')
            
                setError('')
                setMessage('')
            
                if (!token) {
                  setPage('login')
                  setMessage('Please log in to view your learning.')
                  return
                }
            
                try {
                  const response = await fetch(`${API}/enrollments/my-courses/`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
            
                  const data = await response.json()
            
                  if (!response.ok) {
                    throw new Error(data.error || 'Could not load your courses.')
                  } 
                  setMyCourses(Array.isArray(data) ? data : [])
                        setPage('my-learning')
                      } catch (err) {
                        setError(err.message || 'Unable to load your courses.')
                      }
                    }
                  
                    function logout() {
                      localStorage.removeItem('access_token')
                      setUser(null)
                      setMyCourses([])
                      setMessage('You have logged out.')
                      setError('')
                      setPage('home')
                    }
                  
                    const visibleCourses = courses.filter((course) =>
                      (course.title || '').toLowerCase().includes(search.toLowerCase())
                    )
                  
                    function openPage(nextPage) {
                      setMessage('')
                      setError('')
                      setPassword('')
                      setPage(nextPage)
                    }
                  
                    function renderCourses(list) {
                      if (list.length === 0) {
                        return <p className="col-span-full text-gray-600">No courses found.</p>
                      }
                  
                      return list.map((course) => (
                        <article
                          key={course._id}
                          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-3xl">
                            📚
                          </div>
                          <h3 className="mt-5 text-xl font-bold">
                            {course.title || 'Untitled Course'}
                          </h3>
                          <p className="mt-3 text-gray-600">
                            {course.description || 'Start learning new skills with this course.'}
                          </p>
                          {course.instructor && (
                            <p className="mt-3 text-sm text-gray-500">
                              Instructor: {course.instructor}
                            </p>
                          )}
                           <button
                                    onClick={() => viewCourse(course._id)}
                                    className="mt-5 rounded-lg bg-indigo-50 px-4 py-2 font-semibold text-indigo-600 hover:bg-indigo-100"
                                  >
                                    View Course →
                                  </button>
                                </article>
                              ))
                            }
                          
                            return (
                              <div className="min-h-screen bg-gray-50 text-gray-900">
                                <nav className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-5 shadow-sm md:px-10">
                                  <button
                                    onClick={() => openPage('home')}
                                    className="text-2xl font-bold text-indigo-600"
                                  >
                                    LearnHub
                                  </button>
                          
                                  <div className="flex flex-wrap items-center gap-4">
                                    <button onClick={() => openPage('home')} className="hover:text-indigo-600">
                                      Home
                                    </button>
                                    <button
                                      onClick={() => {
                                        openPage('home')
                                        setTimeout(() => {
                                          document.getElementById('courses')?.scrollIntoView({
                                            behavior: 'smooth',
                                          })
                                        }, 0)
                                      }}
                                      className="hover:text-indigo-600"
                                    >
                                      Courses
                                    </button>
                                    <button onClick={loadMyCourses} className="hover:text-indigo-600">
                                      My Learning
                                    </button>
                          
                                    {user ? (
                                      <>
                                        <span className="text-sm font-medium">
                                          Hi, {user.name}
                                        </span>
                                        <button
                                          onClick={logout}
                                           className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
                                                        >
                                                          Logout
                                                        </button>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <button
                                                          onClick={() => openPage('login')}
                                                          className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
                                                        >
                                                          Login
                                                        </button>
                                                        <button
                                                          onClick={() => openPage('register')}
                                                          className="rounded-lg border border-indigo-600 px-5 py-2 text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                          Register
                                                        </button>
                                                      </>
                                                    )}
                                                  </div>
                                                </nav>
                                          
                                                <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
                                                  {message && (
                                                    <div role="status" className="mb-5 rounded-lg bg-green-50 p-4 text-green-800">
                                                      {message}
                                                    </div>
                                                  )}
                                          
                                                  {error && (
                                                    <div role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
                                                      {error}
                                                    </div>
                                                  )}
                                          
                                                  {(page === 'login' || page === 'register') && (
                                                    <section className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                                                      <h1 className="text-3xl font-bold text-gray-900">
                                                        {page === 'register' ? 'Create Your Account' : 'Welcome Back'}
                                                      </h1>
                                                      <p className="mt-2 text-gray-600">
                                                        {page === 'register'
                                                          ? 'Join LearnHub and start learning.'
                                                          : 'Log in to continue your learning journey.'}
                                                      </p>
                                          
                                                      <form onSubmit={handleAuth} className="mt-7 space-y-5">
                                                        {page === 'register' && (
                                                          <div>
                                                            <label htmlFor="name" className="mb-2 block font-medium">
                                                              Full Name
                                                            </label>
                                                            <input
                                                              id="name"
                                                              type="text"
                                                              autoComplete="name"
                                                              required
                                                              value={name}
                                                              onChange={(e) => setName(e.target.value)}
                                                              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                                                              placeholder="Enter your name"
                                                            />
                                                          </div>
                                                        )}
                                           <div>
                                                          <label htmlFor="email" className="mb-2 block font-medium">
                                                            Email Address
                                                          </label>
                                                          <input
                                                            id="email"
                                                            type="email"
                                                            autoComplete="email"
                                                            required
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                                                            placeholder="Enter your email"
                                                          />
                                                        </div>
                                          
                                                        <div>
                                                          <label htmlFor="password" className="mb-2 block font-medium">
                                                            Password
                                                          </label>
                                                          <input
                                                            id="password"
                                                            type="password"
                                                            autoComplete={
                                                              page === 'register' ? 'new-password' : 'current-password'
                                                            }
                                                            required
                                                            minLength={page === 'register' ? 8 : undefined}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                                                            placeholder="Enter your password"
                                                          />
                                                          {page === 'register' && (
                                                            <p className="mt-1 text-xs text-gray-500">
                                                              Use at least 8 characters.
                                                            </p>
                                                          )}
                                                        </div>
                                          
                                                        <button
                                                          type="submit"
                                                          disabled={submitting}
                                                          className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                                        >
                                                          {submitting
                                                            ? 'Please wait...'
                                                            : page === 'register'
                                                              ? 'Create Account'
                                                              : 'Login'}
                                                        </button>
                                                      </form>
                                                        <p className="mt-6 text-center text-sm text-gray-600">
                                                                    {page === 'register'
                                                                      ? 'Already have an account?'
                                                                      : "Don't have an account?"}{' '}
                                                                    <button
                                                                      onClick={() =>
                                                                        openPage(page === 'register' ? 'login' : 'register')
                                                                      }
                                                                      className="font-semibold text-indigo-600 hover:underline"
                                                                    >
                                                                      {page === 'register' ? 'Login' : 'Register'}
                                                                    </button>
                                                                  </p>
                                                                </section>
                                                              )}
                                                      
                                                              {page === 'home' && (
                                                                <>
                                                                  <section className="rounded-3xl bg-indigo-600 px-7 py-14 text-white md:px-16 md:py-20">
                                                                    <p className="font-semibold uppercase tracking-widest text-indigo-200">
                                                                      Welcome to LearnHub
                                                                    </p>
                                                                    <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                                                                      Learn New Skills.
                                                                      <br />
                                                                      Build Your Future.
                                                                    </h1>
                                                                    <p className="mt-5 max-w-xl text-lg text-indigo-100">
                                                                      Explore online courses, learn at your own pace, and take the
                                                                      next step in your career.
                                                                    </p>
                                                                    <div className="mt-8 flex max-w-xl gap-3">
                                                                      <input
                                                                        type="search"
                                                                        placeholder="Search for courses..."
                                                                        value={search}
                                                                        onChange={(e) => setSearch(e.target.value)}
                                                                        className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-300"
                                                                      />
                                                                      <button
                                                                        onClick={() =>
                                                                          document.getElementById('courses')?.scrollIntoView({
                                                                            behavior: 'smooth',
                                                                          })
                                                                        }
                                                                        className="rounded-lg bg-white px-5 py-3 font-semibold text-indigo-600 hover:bg-indigo-50"
                                                                      >
                                                                        Explore
                                                                      </button>
                                                                    </div>
                                                                  </section>
                                                        <section id="courses" className="py-14">
                                                                    <h2 className="text-3xl font-bold">Explore Our Courses</h2>
                                                                    <p className="mt-2 text-gray-600">
                                                                      Find a course and start learning something new.
                                                                    </p>
                                                      
                                                                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                                      {loading ? (
                                                                        <p className="col-span-full">Loading courses...</p>
                                                                      ) : error && courses.length === 0 ? (
                                                                        <p className="col-span-full text-red-600">{error}</p>
                                                                      ) : (
                                                                        renderCourses(visibleCourses)
                                                                      )}
                                                                    </div>
                                                                  </section>
                                                                </>
                                                              )}   {page === 'course-details' && (
                                                                        <section>
                                                                          <button
                                                                            onClick={() => {
                                                                              setMessage('')
                                                                              setError('')
                                                                              setPage(courseOrigin === 'my-learning' ? 'my-learning' : 'home')
                                                                            }}
                                                                            className="mb-6 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
                                                                          >
                                                                            ← Back to courses
                                                                          </button>
                                                              
                                                                          {detailLoading ? (
                                                                            <p className="text-gray-600">Loading course details...</p>
                                                                          ) : selectedCourse ? (
                                                                            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
                                                                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-4xl">
                                                                                📚
                                                                              </div>
                                                                              <h1 className="mt-5 text-3xl font-bold">{selectedCourse.title}</h1>
                                                                              <p className="mt-4 leading-7 text-gray-600">
                                                                                {selectedCourse.description || 'No course description available.'}
                                                                              </p>
                                                                              {selectedCourse.instructor && (
                                                                                <p className="mt-4 text-sm text-gray-500">
                                                                                  Instructor: {selectedCourse.instructor}
                                                                                </p>
                                                                              )}  <div className="mt-8 border-t border-gray-200 pt-6">
                                                                                                <h2 className="text-2xl font-bold">Course Lessons</h2>
                                                                                                {Array.isArray(selectedCourse.lessons) && selectedCourse.lessons.length > 0 ? (
                                                                                                  <div className="mt-5 space-y-4">
                                                                                                    {selectedCourse.lessons.map((lesson, index) => (
                                                                                                      <article
                                                                                                        key={lesson._id || `${lesson.title}-${index}`}
                                                                                                        className="rounded-xl border border-gray-200 p-5"
                                                                                                      >
                                                                                                        <p className="text-sm font-semibold text-indigo-600">
                                                                                                          Lesson {index + 1}
                                                                                                        </p>
                                                                                                        <h3 className="mt-1 text-lg font-bold">{lesson.title}</h3>
                                                                                                        <p className="mt-2 text-gray-600">
                                                                                                          {lesson.description || 'No lesson description available.'}

                                                                                                        </p>
                                                                                                        {lesson.video && (
                                                                                                        <div className="mt-4 overflow-hidden rounded-xl">
                                                                                                         <iframe
                                                                                                            src={lesson.video}
                                                                                                            title={lesson.title}
                                                                                                            className="w-full aspect-video"
                                                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                                                            referrerPolicy="strict-origin-when-cross-origin"
                                                                                                            allowFullScreen
                                                                                                          />
                                                                                                        </div>
                                                                                                      )}
                                                                                                        {lesson.video && (
                                                                                                          <p className="mt-3">
                                                                                                            <a
                                                                                                              href={
                                                                                                                lesson.video.includes("embed/videoseries")
                                                                                                                  ? `https://www.youtube.com/playlist?list=${lesson.video.split("list=")[1]}`
                                                                                                                  : lesson.video.replace(
                                                                                                                      "youtube.com/embed/",
                                                                                                                      "youtube.com/watch?v="
                                                                                                                    )
                                                                                                              }
                                                                                                              target="_blank"
                                                                                                              rel="noreferrer"
                                                                                                              className="font-semibold text-indigo-600 hover:underline"
                                                                                                            >
                                                                                                              Open lesson video
                                                                                                            </a>
                                                                                                          </p>
                                                                                                        )}
                                                                                                        {lesson.pdf && (
                                                                                                          <p className="mt-2">
                                                                                                            <a
                                                                                                              href={lesson.pdf}
                                                                                                              target="_blank"
                                                                                                              rel="noreferrer"
                                                                                                              className="font-semibold text-indigo-600 hover:underline"
                                                                                                            >
                                                                                                              View lesson PDF
                                                                                                            </a>
                                                                                                          </p>
                                                                                                        )}
                                                                                                      </article>
                                                                                                    ))}
                                                                                                  </div>                  ) : (
                                                                                                                      <p className="mt-4 text-gray-600">Lessons will be added soon.</p>
                                                                                                                    )}
                                                                                                                  </div>
                                                                                                  
                                                                                                                  <button
                                                                                                                    onClick={enrollInCourse}
                                                                                                                    disabled={enrolling}
                                                                                                                    className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                                                                                  >
                                                                                                                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                                                                                                  </button>
                                                                                                                  {!user && (
                                                                                                                    <p className="mt-3 text-sm text-gray-500">
                                                                                                                      Please log in to enroll in this course.
                                                                                                                    </p>
                                                                                                                  )}
                                                                                                                </article>
                                                                                                              ) : (
                                                                                                                <p className="text-gray-600">Course details are not available.</p>
                                                                                                              )}
                                                                                                            </section>
                                                                                                          )}
                                                                                                    {page === 'my-learning' && (
                                                                                                            <section>
                                                                                                              <h1 className="text-3xl font-bold">My Learning</h1>
                                                                                                              <p className="mt-2 text-gray-600">
                                                                                                                Continue learning from your enrolled courses.
                                                                                                              </p>
                                                                                                              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                                                                                {renderCourses(myCourses)}
                                                                                                              </div>
                                                                                                              <button
                                                                                                                onClick={() => openPage('home')}
                                                                                                                className="mt-8 rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
                                                                                                              >
                                                                                                                Explore More Courses
                                                                                                              </button>
                                                                                                            </section>
                                                                                                          )}
                                                                                                        </main>  <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
                                                                                                                © {new Date().getFullYear()} LearnHub. Keep learning, keep growing.
                                                                                                              </footer>
                                                                                                            </div>
                                                                                                          )
                                                                                                        }
                                                                                                        
                                                                                                        export default App
                                                                                                        