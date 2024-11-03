// app/smart-fridge-dashboard.tsx
"use client";

import * as React from "react";
import { LogOut, RefreshCw, User, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modetoggle";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import logo from "/public/logo.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { database, ref, onValue, push, set, remove } from "@/components/firebaseconfig";

interface FoodItem {
  name: string;
  quantity: number;
  calorie: number;
}

interface ScheduleItem {
  id: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
}

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  instructions: string;
}

export default function SmartFridgeDashboard() {
  const { user } = useUser();
  const [foodItems, setFoodItems] = React.useState<FoodItem[]>([]);
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>([]);
  const [className, setClassName] = React.useState("");
  const [day, setDay] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = React.useState<RecipeDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = React.useState(false);
  const [availableTime, setAvailableTime] = React.useState("");
  const [suggestedRecipe, setSuggestedRecipe] = React.useState("");

  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  React.useEffect(() => {
    const aiResponsesRef = ref(database, "ai_responses");
    onValue(aiResponsesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        const latestKey = keys.length > 0 ? keys[keys.length - 1] : null;
        if (latestKey && data[latestKey]) {
          const latestData = data[latestKey].foodItems;
            const foodItemsWithIds = latestData
            ? Object.keys(latestData).map((key) => ({
              id: key,
              ...latestData[key],
              }))
            // : [{ id: "0", name: "No food Available", quantity: 0, calorie: 0 }];
            : [{ id: "1", name: "Chicken", quantity: 1, calorie: 1000 }];
          setFoodItems(foodItemsWithIds);
        }
      }
    });

    const scheduleRef = ref(database, "schedule");
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      let loadedSchedule = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
      loadedSchedule = loadedSchedule.sort((a, b) => {
        const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayComparison !== 0) return dayComparison;
        return new Date(`1970-01-01T${a.startTime}`).getTime() - new Date(`1970-01-01T${b.startTime}`).getTime();
      });
      setSchedule(loadedSchedule);
    });
  }, []);

  const handleFoodDelete = async (name: string) => {
    try {
      const foodItemRef = ref(database, `ai_responses/foodItems`);
      onValue(foodItemRef, (snapshot) => {
        const items = snapshot.val();
        const updatedItems = items ? items.filter((item: FoodItem) => item.name !== name) : [];
        set(foodItemRef, updatedItems);
      });
      setFoodItems((prevItems) => prevItems.filter((item) => item.name !== name));
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const handleAddClass = async () => {
    const newClassRef = push(ref(database, "schedule"));
    await set(newClassRef, { className, day, startTime, endTime });
    setClassName("");
    setDay("");
    setStartTime("");
    setEndTime("");
  };

  const handleDeleteClass = async (classId: string) => {
    await remove(ref(database, `schedule/${classId}`));
  };

  const fetchRecipes = async () => {
    const apiKey = '49ced12e95f64e30a325e3d257ab010e';
    const ingredients = foodItems.map((item) => item.name).join(',');
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
        params: { ingredients, apiKey, number: 5, ranking: 2, ignorePantry: true },
      });
      const recipeData: Recipe[] = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        image: item.image,
      }));
      setRecipes(recipeData);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleViewRecipe = async (recipeId: number) => {
    const apiKey = '6311ae6ba06349b9b24ebc42b19fb517';
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: { includeNutrition: false, apiKey },
      });
      const data = response.data;
      setSelectedRecipe({
        id: data.id,
        title: data.title,
        image: data.image,
        instructions: data.instructions,
      });
      const genAI = new GoogleGenerativeAI('AIzaSyBCag4JyNXDZDsZhUdltv-ftc-0Jfcy7GM');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const parsedInstructions = await model.generateContent(
        `Please itemize the following instructions using proper step numbers and also proper html tag so that it align nicely 
        on the website, make sure to also generate the numbers in from of the each step, for example: 1. Boil water
         don't generate any extra comment or sentence that you are talking to me, 
         make sure the receipe matches with the instructions if not change the instruction with correct receipe , food:${data.title} instructions: ${data.instructions}`
        );
      setSelectedRecipe({
        id: data.id,
        title: data.title,
        image: data.image,
        instructions: parsedInstructions.response.text(),
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  const handlePrepareRecipe = async () => {
    const genAI = new GoogleGenerativeAI('AIzaSyBCag4JyNXDZDsZhUdltv-ftc-0Jfcy7GM');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
      const response = await model.generateContent(
        `Suggest a recipe that can be prepared in ${availableTime} minutes using ingredients like ${foodItems.map(item => item.name).join(', ')}.`
      );
      setSuggestedRecipe(response.response.text());
      setIsRecipeDialogOpen(false);
    } catch (error) {
      console.error("Error fetching recipe recommendation:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-50 w-full border-b bg-gray-100 dark:bg-gray-900 shadow-sm">
        <div className="container flex h-10 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Image src={logo} alt="Company Logo" width={150} height={150} />
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-black dark:text-white">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem>
                      <a href="/user-info" className="flex items-center space-x-2">
                        <img src={user.picture ?? ''} alt={user.name ?? 'User'} className="h-6 w-6 rounded-full" />
                        <span>{user.name}</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/api/auth/logout">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </a>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <a href="/api/auth/login" className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Login
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 px-4 space-y-6">
        <Tabs defaultValue="dashboard">
            <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="dashboard" className="text-gray-700 dark:text-gray-300 text-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="recipes" className="text-gray-700 dark:text-gray-300 text-lg">Recipes</TabsTrigger>
            <TabsTrigger value="schedules" className="text-gray-700 dark:text-gray-300 text-lg">Schedules</TabsTrigger>
            </TabsList>
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-2xl font-bold text-black dark:text-white">Food Detection Dashboard</h2>
              <Button variant="outline" size="icon" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Calories</th>
                <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Delete</span>
                </th>
              </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {foodItems.map((item, index) => (
                <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.calorie}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button onClick={() => handleFoodDelete(item.name)} variant="destructive" className="text-gray-600 dark:text-gray-400">Delete</Button>
                </td>
                </tr>
              ))}
              </tbody>
            </table>
          </TabsContent>
            <TabsContent value="schedules" className="space-y-6 pt-8">
            <Card className="bg-gray-100 dark:bg-gray-800 mx-auto" style={{ maxWidth: "75%" }}>
              <CardHeader>
              <CardTitle className="text-black dark:text-white">Schedules</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Manage your class schedule</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                
              <div className="flex justify-center space-x-4 mb-4">
                {dayOrder.map((d) => (
                  <Button
                    key={d}
                    variant={day === d ? "default" : "outline"}
                    onClick={() => setDay(d)}
                    className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    {d}
                  </Button>
                ))}
              </div>
              <div className="grid gap-4">
                {schedule
                  .filter((class_) => class_.day === day)
                  .map((class_) => (
                    <div
                      key={class_.id}
                      className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-4"
                    >
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-black dark:text-white">
                          {class_.className}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-gray-600 dark:text-gray-400">{class_.day}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-gray-600 dark:text-gray-400">
                          {class_.startTime} - {class_.endTime}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClass(class_.id)}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
                {schedule.map((class_, index) => {
                const nextClass = schedule[index + 1];
                if (nextClass) {
                  const endTime = new Date(`1970-01-01T${class_.endTime}`).getTime();
                  const startTime = new Date(`1970-01-01T${nextClass.startTime}`).getTime();
                  const timeGap = (startTime - endTime) / 60000; // time gap in minutes
                  const hoursGap = timeGap / 60;
                  const foodsuggested = 0;
                  if (timeGap > 15 && foodsuggested < 3) {
                  
                  const genAI = new GoogleGenerativeAI('AIzaSyBCag4JyNXDZDsZhUdltv-ftc-0Jfcy7GM');
                  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    fetchRecipes();
                    const recipeList = recipes.map(recipe => recipe.title).join(', ');
                    model.generateContent(
                    ` Along this receipt list ${recipeList}.
                     which once can be make under the time ${timeGap}, 
                     this is the time gap in between my two events in my schedule, 
                     among thoses list which one would be the best. just give me the name, nothing else don't generate any any information., `
                    ).then(response => {
                    const suggestedRecipe = response.response.text();
                    if (suggestedRecipe) {
                    setSchedule(prevSchedule => {
                      const updatedSchedule = [...prevSchedule];
                      updatedSchedule.splice(index + 1, 0, {
                      id: `suggestion-${index}`,
                      className: `Food: ${suggestedRecipe}`,
                      day: class_.day,
                      startTime: class_.endTime,
                      endTime: nextClass.startTime,
                      });
                      return updatedSchedule;
                    });
                    }
                  }).catch(error => {
                    console.error("Error fetching recipe recommendation:", error);
                  });
                  }
                }
                return null;
                })}
              <Dialog>
              <DialogTrigger asChild>
                  <Button variant="outline" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"><Plus className="mr-2 h-4 w-4" /> Add Class</Button>
                </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-black text-black dark:text-white">
                      <DialogHeader>
                        <DialogTitle>Add New Class</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="class-name" className="text-gray-700 dark:text-gray-300">Class Name</Label>
                          <Input id="class-name" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Enter class name" className="bg-white dark:bg-black text-black dark:text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="day" className="text-gray-700 dark:text-gray-300">Day</Label>
                          <Select onValueChange={(value) => setDay(value)}>
                            <SelectTrigger className="bg-white dark:bg-black text-black dark:text-white">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black text-black dark:text-white">
                              {dayOrder.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="start-time" className="text-gray-700 dark:text-gray-300">Start Time</Label>
                          <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Enter start time" className="bg-white dark:bg-black text-black dark:text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time" className="text-gray-700 dark:text-gray-300">End Time</Label>
                            <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="Enter end time" className="bg-white dark:bg-black text-black dark:text-white" />
                          </div>
                          </div>
                          <DialogFooter className="flex justify-between space-x-4">
                          <Button variant="outline" onClick={handleAddClass} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">Add Class</Button>

                          </DialogFooter>
                        </DialogContent>
                        </Dialog>
                        <Button variant="outline" onClick={() => setIsRecipeDialogOpen(true)} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                            Prepare Recipe
                          </Button>
                        <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
                    <DialogContent className="bg-white dark:bg-black text-black dark:text-white">
                      <DialogHeader>
                        <DialogTitle>Prepare a Recipe</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Label htmlFor="prep-time" className="text-gray-700 dark:text-gray-300">Available Preparation Time (minutes)</Label>
                        <Input id="prep-time" type="number" value={availableTime} onChange={(e) => setAvailableTime(e.target.value)} placeholder="Enter time in minutes" className="bg-white dark:bg-black text-black dark:text-white" />
                      </div>
                      <DialogFooter>
                        <Button variant="outline"onClick={handlePrepareRecipe} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">Generate Recipe</Button>
                        
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {suggestedRecipe && (
                    <div className="mt-4 text-black dark:text-white">
                      <h3 className="text-xl font-bold">Suggested Recipe</h3>
                      <p>{suggestedRecipe}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            <TabsContent value="recipes" className="space-y-6">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">Recipe Suggestions</h2>
                <Button variant="outline" onClick={fetchRecipes} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white p-2">
                  Generate New Recipes
                  <RefreshCw className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} className="bg-gray-100 dark:bg-gray-800 flex flex-col items-center">
                    <Image alt={recipe.title} className="aspect-video object-cover w-full h-full" height={200} src={recipe.image} width={200} />
                    <div className="p-4 w-full flex justify-between items-center">
                      <CardTitle className="text-black dark:text-white">{recipe.title}</CardTitle>
                      <Button variant="outline" onClick={() => handleViewRecipe(recipe.id)} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">View Recipe</Button>
                    </div>
                  </Card>
                ))}
              </div>
                {isModalOpen && selectedRecipe && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg max-w-md mx-auto dark:bg-black dark:text-white overflow-y-auto max-h-full">
                  <h3 className="text-xl font-bold">{selectedRecipe.title}</h3>
                  <Image alt={selectedRecipe.title} className="my-4 rounded-md object-cover" height={200} src={selectedRecipe.image} width={200} />
                    <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">Close</Button>
                  </div>
                </div>
                )}
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
