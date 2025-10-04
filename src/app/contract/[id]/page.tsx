import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContractService } from '@/lib/contractService';
import { formatDateRange, getDaysUntilExpiration, isContractExpiringSoon } from '@/lib/contractUtils';
import { splitCategories } from '@/lib/categoryUtils';
import Link from 'next/link';
import { SaveContractButton } from '@/components/SaveContractButton';

interface ContractPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContractPage({ params }: ContractPageProps) {
  const { id } = await params;
  const contract = await ContractService.getContractById(id);

  if (!contract) {
    notFound();
  }

  const relatedContracts = await ContractService.getRelatedContracts(contract);
  const daysUntilExpiration = getDaysUntilExpiration(contract.endDate);
  const isExpiringSoon = isContractExpiringSoon(contract.endDate);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-gray-900">Search</Link>
            <span>/</span>
            <span className="text-gray-900">Contract Details</span>
          </div>
        </nav>

        {/* Contract Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              {contract.source}
            </Badge>
            {splitCategories(contract.category).map(cat => (
              <Badge key={cat} variant="outline" className="text-sm">
                {cat}
              </Badge>
            ))}
            {isExpiringSoon && (
              <Badge variant="destructive" className="text-sm">
                Expiring Soon
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {contract.contractTitle}
          </h1>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-gray-600 mb-2">
                Supplier: <span className="font-semibold text-gray-900">{contract.supplierName}</span>
              </p>
              <p className="text-sm text-gray-500">
                Contract ID: {contract.contractId}
              </p>
            </div>
            <div className="text-right">
              <Button asChild>
                <a href={contract.url} target="_blank" rel="noopener noreferrer">
                  View Original Contract
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {contract.contractDescription}
                </p>
              </CardContent>
            </Card>

            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contract ID</dt>
                    <dd className="text-sm text-gray-900">{contract.contractId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Source</dt>
                    <dd className="text-sm text-gray-900">{contract.source}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{contract.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                    <dd className="text-sm text-gray-900">{contract.supplierName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contract Period</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDateRange(contract.startDate, contract.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Days Until Expiration</dt>
                    <dd className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                      {daysUntilExpiration} days
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SaveContractButton contractId={contract.id} />
                <Button className="w-full" variant="outline">
                  Share Contract
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href={contract.url} target="_blank" rel="noopener noreferrer">
                    View Original
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Contract Status */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Date</span>
                    <span className="text-sm font-medium">
                      {contract.startDate ? contract.startDate.toLocaleDateString() : 'Not Provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">End Date</span>
                    <span className="text-sm font-medium">
                      {contract.endDate ? contract.endDate.toLocaleDateString() : 'Not Provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expires In</span>
                    <span className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                      {daysUntilExpiration !== null ? `${daysUntilExpiration} days` : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Contracts */}
            {relatedContracts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Contracts</CardTitle>
                  <CardDescription>
                    Other contracts from the same supplier or category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedContracts.map((relatedContract) => (
                      <div key={relatedContract.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-1 line-clamp-2">
                          <Link 
                            href={`/contract/${relatedContract.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {relatedContract.contractTitle}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {relatedContract.source}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {relatedContract.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Expires: {relatedContract.endDate ? relatedContract.endDate.toLocaleDateString() : 'Not Provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic route - contracts will be fetched on demand
