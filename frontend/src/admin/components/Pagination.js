import React from 'react';
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const PaginationData = ({
    total = 0,
    limit = 10,
    setActivePage = () => { },
    activePage = 1,
}) => {
    const totalPages = (total, limit) => {
        const pages = [];
        for (let i = 1; i <= Math.ceil(total / limit); i++) {
            pages.push(i)
        }
        return pages;
    }

    return (
        <Pagination className='float-end'>
            <PaginationItem onClick={() => setActivePage(1)}>
                <PaginationLink className="shadow-none"
                    first
                    href="#"
                    onClick={(e) => e.preventDefault()}
                />
            </PaginationItem>
            {
                activePage === 1 ? null : (
                    <PaginationItem onClick={() => setActivePage(prev => prev - 1)}>
                        <PaginationLink className="shadow-none"
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            previous
                        />
                    </PaginationItem>
                )
            }
            {
                totalPages(total, limit)?.map((page) => {
                    return (
                        <PaginationItem active={page === activePage} key={page} onClick={() => setActivePage(page)}>
                            <PaginationLink className="shadow-none" href="#"
                                onClick={(e) => e.preventDefault()}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    )
                })
            }
            {activePage === Math.ceil(total / limit) ? null : (
                <PaginationItem onClick={() => setActivePage(prev => prev + 1)}>
                    <PaginationLink className="shadow-none"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        next
                    />
                </PaginationItem>
            )}
            <PaginationItem onClick={() => setActivePage(Math.ceil(total / limit))}>
                <PaginationLink className="shadow-none"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    last
                />
            </PaginationItem>
        </Pagination>
    )
}

export default PaginationData;