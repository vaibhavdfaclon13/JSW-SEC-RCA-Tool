import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Define the data directory path
const DATA_DIR = path.join(process.cwd(), 'data')
const USER_DATA_FILE = path.join(DATA_DIR, 'users.json')

interface UserData {
  userId: string
  selectedInsightId?: string
  lastUsed: string
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Read users data from file
async function readUsersData(): Promise<Record<string, UserData>> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(USER_DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

// Write users data to file
async function writeUsersData(data: Record<string, UserData>) {
  await ensureDataDir()
  await fs.writeFile(USER_DATA_FILE, JSON.stringify(data, null, 2))
}

// GET /api/user - Get current user data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const usersData = await readUsersData()
    const userData = usersData[userId]

    if (!userData) {
      return NextResponse.json({ 
        userId, 
        selectedInsightId: null,
        exists: false 
      })
    }

    return NextResponse.json({
      userId: userData.userId,
      selectedInsightId: userData.selectedInsightId || null,
      exists: true
    })
  } catch (error) {
    console.error('Error reading user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user - Store/update user data
export async function POST(request: NextRequest) {
  try {
    const { userId, selectedInsightId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const usersData = await readUsersData()
    
    // Update user data
    usersData[userId] = {
      userId,
      selectedInsightId: selectedInsightId || usersData[userId]?.selectedInsightId,
      lastUsed: new Date().toISOString()
    }

    await writeUsersData(usersData)

    return NextResponse.json({ 
      success: true, 
      userData: usersData[userId] 
    })
  } catch (error) {
    console.error('Error storing user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/user - Remove user data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const usersData = await readUsersData()
    delete usersData[userId]
    await writeUsersData(usersData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 