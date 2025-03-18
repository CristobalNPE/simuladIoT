import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Edit, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"
import type {SensorCategory} from "~/types/sensor.types";

interface EditDeviceDialogProps {
    deviceName: string
    setDeviceName: (value: string) => void
    sensorApiKey: string
    setSensorApiKey: (value: string) => void
    sensorCategory: SensorCategory
    setSensorCategory: (value: SensorCategory) => void
    generateSamplePayload: () => void
}

export function EditDeviceDialog({
                                     deviceName,
                                     setDeviceName,
                                     sensorApiKey,
                                     setSensorApiKey,
                                     sensorCategory,
                                     setSensorCategory,
                                     generateSamplePayload,
                                 }: EditDeviceDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Dispositivo</DialogTitle>
                    <DialogDescription>Personaliza la configuración de tu dispositivo IoT</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="api-key" className="text-right">
                            API Key
                        </Label>
                        <Input
                            onFocus={(e) => e.target.select()}
                            autoFocus
                            id="api-key"
                            value={sensorApiKey}
                            onChange={(e) => setSensorApiKey(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Categoría
                        </Label>
                        <Select value={sensorCategory} onValueChange={setSensorCategory}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="temperature">Temperatura y Humedad</SelectItem>
                                <SelectItem value="pressure">Presión y altitud</SelectItem>
                                <SelectItem value="motion">Movimiento y Distancia</SelectItem>
                                <SelectItem value="voltage">Voltaje & Corriente</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={generateSamplePayload}>
                            <Sparkles className="mr-1 h-4 w-4" />
                            Generar Payload
                        </Button>
                    </DialogClose>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}