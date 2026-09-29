"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface Student {
  id: string;
  nis: string;
  full_name: string;
  gender: string;
  class_name: string;
  halaqah_name: string | null;
  status: string;
}

interface MasterOption {
  id: string;
  name: string;
}

export default function ManajemenSantriPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterOption[]>([]);
  const [halaqahs, setHalaqahs] = useState<MasterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [halaqahFilter, setHalaqahFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/master/classes").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/master/halaqahs").then((r) => (r.ok ? r.json() : [])),
    ]).then(([resClasses, resHalaqahs]) => {
      setClasses(resClasses);
      setHalaqahs(resHalaqahs);
    });
  }, []);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (classFilter && classFilter !== "all") params.set("classId", classFilter);
      if (halaqahFilter && halaqahFilter !== "all") params.set("halaqahId", halaqahFilter);
      
      const res = await fetch(`/api/santri?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classFilter, halaqahFilter]);

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return s.full_name.toLowerCase().includes(query) || 
           s.nis.toLowerCase().includes(query) ||
           s.class_name.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Buku Induk Santri</h1>
        <p className="text-muted-foreground mt-1">Tabel lengkap data santri dengan filter lanjutan</p>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              placeholder="Cari nama, NIS, atau jenjang..." 
              className="flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="w-full sm:w-48">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenjang</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={halaqahFilter} onValueChange={setHalaqahFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Level</SelectItem>
                  {halaqahs.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>Total {filteredStudents.length} santri</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aksi</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenjang</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/manajemen/santri/${student.id}`}>Detail</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{student.nis}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.class_name}</TableCell>
                      <TableCell>{student.halaqah_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === "aktif" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}